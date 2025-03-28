import { IEntity } from './entity.interface';

export interface IResource extends IEntity {
  topicId: string;
  url: string;
  description: string;
  type: string;
}
