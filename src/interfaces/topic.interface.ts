import { IEntity } from './entity.interface';
import { IResource } from './resource.interface';

export interface ITopic extends IEntity {
  name: string;
  content: string;
  version: number;
  parentTopicId?: string | null;
  resources?: IResource[];
  childTopics?: ITopic[];
  parentTopic?: ITopic | null;
  versions?: ITopicVersion[];
}

export interface ITopicVersion extends IEntity {
  topicId: string;
  name: string;
  content: string;
  version: number;
  topic?: ITopic;
}
