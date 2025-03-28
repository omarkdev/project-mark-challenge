import { ITopic, ITopicVersion } from '../interfaces/topic.interface';
import { IResource } from '../interfaces/resource.interface';

export abstract class TopicComponent {
  protected id: string;
  protected name: string;
  protected content: string;
  protected version: number;
  protected parentTopicId: string | null;
  protected resources: IResource[];
  protected childTopics: ITopic[];
  protected parentTopic: ITopic | null;
  protected versions: ITopicVersion[];
  protected createdAt: Date;
  protected updatedAt: Date;

  constructor(topic: ITopic) {
    this.id = topic.id;
    this.name = topic.name;
    this.content = topic.content;
    this.version = topic.version;
    this.parentTopicId = topic.parentTopicId || null;
    this.resources = topic.resources || [];
    this.childTopics = topic.childTopics || [];
    this.parentTopic = topic.parentTopic || null;
    this.versions = topic.versions || [];
    this.createdAt = topic.createdAt || new Date();
    this.updatedAt = topic.updatedAt || new Date();
  }

  abstract addChild(child: TopicComponent): void;
  abstract removeChild(childId: string): void;
  abstract getChild(childId: string): TopicComponent | null;
  abstract isComposite(): boolean;

  getId(): string {
    return this.id;
  }

  getPath(): string[] {
    return [this.name];
  }
}
