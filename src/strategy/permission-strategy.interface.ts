import { ITopic } from '../interfaces/topic.interface';
import { IUser } from '../interfaces/user.interface';

export interface IPermissionStrategy {
  canCreateTopic(user: IUser): boolean;
  canEditTopic(user: IUser, topic: ITopic): boolean;
  canDeleteTopic(user: IUser, topic: ITopic): boolean;
  canViewTopic(user: IUser, topic: ITopic): boolean;
}
