import { randomUUID } from 'crypto';
import { ITopic, ITopicVersion } from '../interfaces/topic.interface';

export class TopicVersionFactory {
  createVersion(topic: ITopic, version: number): ITopicVersion {
    return {
      id: randomUUID(),
      topicId: topic.id,
      name: topic.name,
      content: topic.content,
      version: version,
      createdAt: new Date()
    };
  }

  createInitialVersion(topic: ITopic): ITopicVersion {
    return this.createVersion(topic, 1);
  }

  createNextVersion(topic: ITopic, currentVersion: number): ITopicVersion {
    return this.createVersion(topic, currentVersion + 1);
  }
}
