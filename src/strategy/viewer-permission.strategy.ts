import { IPermissionStrategy } from './permission-strategy.interface';
import { ITopic } from '../interfaces/topic.interface';
import { IUser, UserRole } from '../interfaces/user.interface';

export class ViewerPermissionStrategy implements IPermissionStrategy {
  canCreateTopic(user: IUser): boolean {
    return false;
  }

  canEditTopic(user: IUser, topic: ITopic): boolean {
    return false;
  }

  canDeleteTopic(user: IUser, topic: ITopic): boolean {
    return false;
  }

  canViewTopic(user: IUser, topic: ITopic): boolean {
    return true;
  }
}
