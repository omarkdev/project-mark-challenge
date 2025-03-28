import { TopicComponent } from './topic-component.abstract';
import { ITopic } from '../interfaces/topic.interface';

export class TopicLeaf extends TopicComponent {
  constructor(topic: ITopic) {
    super(topic);
  }

  getPath(): string[] {
    return [this.name];
  }

  addChild(child: TopicComponent): void {
    throw new Error('Leaf topics cannot have children');
  }

  removeChild(childId: string): void {
    throw new Error('Leaf topics cannot have children');
  }

  getChild(childId: string): TopicComponent | null {
    return null;
  }

  isComposite(): boolean {
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      version: this.version,
      parentTopicId: this.parentTopicId,
      resources: this.resources,
      childTopics: this.childTopics,
      parentTopic: this.parentTopic,
      versions: this.versions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
