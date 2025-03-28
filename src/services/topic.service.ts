import { PrismaClient } from '@prisma/client';
import { Repository } from '../abstracts/repository.abstract';
import { ITopic, ITopicVersion } from '../interfaces/topic.interface';
import { IUser } from '../interfaces/user.interface';
import { TopicVersionFactory } from '../factory/topic-version.factory';
import { TopicComposite } from '../composite/topic-composite';
import { TopicLeaf } from '../composite/topic-leaf';
import { TopicComponent } from '../composite/topic-component.abstract';
import { AdminPermissionStrategy } from '../strategy/admin-permission.strategy';
import { EditorPermissionStrategy } from '../strategy/editor-permission.strategy';
import { ViewerPermissionStrategy } from '../strategy/viewer-permission.strategy';
import { IPermissionStrategy } from '../strategy/permission-strategy.interface';
import { TopicNode } from '../services/topic-path-finder.service';

export class TopicService extends Repository<ITopic> {
  private versionFactory: TopicVersionFactory;
  protected modelName = 'topic';
  private permissionStrategies: { [key: string]: IPermissionStrategy } = {
    admin: new AdminPermissionStrategy(),
    editor: new EditorPermissionStrategy(),
    viewer: new ViewerPermissionStrategy(),
  };

  constructor() {
    super();
    this.versionFactory = new TopicVersionFactory();
  }

  private getPermissionStrategy(user: IUser): IPermissionStrategy {
    return this.permissionStrategies[user.role.toLowerCase()] || this.permissionStrategies.viewer;
  }

  async findAll(): Promise<ITopic[]> {
    const topics = await this.prisma.topic.findMany();
    return topics as ITopic[];
  }

  async findById(id: string): Promise<ITopic | null> {
    const topic = await this.prisma.topic.findUnique({
      where: { id }
    });
    return topic as ITopic | null;
  }

  private async getTopicRecursive(id: string, visitedIds = new Set<string>()): Promise<TopicNode | null> {
    if (visitedIds.has(id)) {
      return null; // Prevent infinite recursion
    }
    visitedIds.add(id);

    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        resources: true,
        childTopics: true,
        parentTopic: true
      }
    });

    if (!topic) {
      return null;
    }

    // Recursively get child topics
    const childTopics = await Promise.all(
      topic.childTopics.map(child => this.getTopicRecursive(child.id, visitedIds))
    );

    // Recursively get parent topic
    let parentTopic = null;
    if (topic.parentTopicId) {
      parentTopic = await this.getTopicRecursive(topic.parentTopicId, visitedIds);
    }

    return {
      ...topic,
      childTopics: childTopics.filter((child): child is TopicNode => child !== null),
      parentTopic,
      resources: topic.resources
    } as TopicNode;
  }

  async getTopicWithChildren(topicId: string): Promise<TopicNode | null> {
    return this.getTopicRecursive(topicId);
  }

  async getTopicVersions(topicId: string): Promise<ITopicVersion[]> {
    const versions = await this.prisma.topicVersion.findMany({
      where: { topicId },
      orderBy: { version: 'desc' }
    });
    return versions as ITopicVersion[];
  }

  async create(data: {
    name: string;
    content: string;
    parentTopicId?: string | null;
    user: IUser;
  }): Promise<ITopic> {
    const { name, content, parentTopicId, user } = data;
    const permissionStrategy = this.getPermissionStrategy(user);

    if (!permissionStrategy.canCreateTopic(user)) {
      throw new Error('User does not have permission to create topics');
    }

    if (parentTopicId) {
      const parentTopic = await this.findById(parentTopicId);
      if (!parentTopic) {
        throw new Error('Parent topic not found');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create the topic
      const newTopic = await prisma.topic.create({
        data: {
          name,
          content,
          parentTopicId
        }
      });

      // Create initial version using factory
      const initialVersion = this.versionFactory.createInitialVersion(newTopic as ITopic);
      await prisma.topicVersion.create({
        data: {
          topicId: initialVersion.topicId,
          name: initialVersion.name,
          content: initialVersion.content,
          version: initialVersion.version
        }
      });

      return newTopic as ITopic;
    });
  }

  async update(
    id: string,
    data: {
      name: string;
      content: string;
      user: IUser;
    }
  ): Promise<ITopic> {
    const { name, content, user } = data;
    const permissionStrategy = this.getPermissionStrategy(user);
    const topic = await this.findById(id);

    if (!topic) {
      throw new Error('Topic not found');
    }

    if (!permissionStrategy.canEditTopic(user, topic)) {
      throw new Error('User does not have permission to edit this topic');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update the topic
      const updatedTopic = await prisma.topic.update({
        where: { id },
        data: {
          name,
          content,
          version: topic.version + 1
        }
      });

      // Create new version using factory
      const newVersion = this.versionFactory.createNextVersion(updatedTopic as ITopic, topic.version);
      await prisma.topicVersion.create({
        data: {
          topicId: newVersion.topicId,
          name: newVersion.name,
          content: newVersion.content,
          version: newVersion.version
        }
      });

      return updatedTopic as ITopic;
    });
  }

  async delete(id: string, user: IUser): Promise<ITopic> {
    const permissionStrategy = this.getPermissionStrategy(user);
    const topic = await this.findById(id);

    if (!topic) {
      throw new Error('Topic not found');
    }

    if (!permissionStrategy.canDeleteTopic(user, topic)) {
      throw new Error('User does not have permission to delete this topic');
    }

    const deletedTopic = await this.prisma.topic.delete({
      where: { id }
    });

    return deletedTopic as ITopic;
  }
}
