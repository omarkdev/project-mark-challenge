import { IResource } from '../interfaces/resource.interface';
import { ITopic } from '../interfaces/topic.interface';
import { TopicComponent } from './topic-component.abstract';
import { TopicLeaf } from './topic-leaf';

export class TopicComposite extends TopicComponent {
  constructor(topic: ITopic) {
    super(topic);
  }

  getPath(): string[] {
    return [this.name, ...this.childTopics.flatMap(child => {
      const childComponent = child.childTopics?.length ? new TopicComposite(child) : new TopicLeaf(child);
      return childComponent.getPath();
    })];
  }

  addChild(child: TopicComponent): void {
    this.childTopics.push(child as unknown as ITopic);
  }

  removeChild(childId: string): void {
    const index = this.childTopics.findIndex(child => child.id === childId);
    if (index !== -1) {
      this.childTopics.splice(index, 1);
    }
  }

  getChild(childId: string): TopicComponent | null {
    const child = this.childTopics.find(child => child.id === childId);
    if (!child) return null;
    return child.childTopics?.length ? new TopicComposite(child) : new TopicLeaf(child);
  }

  isComposite(): boolean {
    return true;
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
