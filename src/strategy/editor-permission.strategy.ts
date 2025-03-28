import { IPermissionStrategy } from './permission-strategy.interface';
import { ITopic } from '../interfaces/topic.interface';
import { IUser, UserRole } from '../interfaces/user.interface';

export class EditorPermissionStrategy implements IPermissionStrategy {
  canCreateTopic(user: IUser): boolean {
    return user.role === UserRole.EDITOR;
  }

  canEditTopic(user: IUser, topic: ITopic): boolean {
    return user.role === UserRole.EDITOR;
  }

  canDeleteTopic(user: IUser, topic: ITopic): boolean {
    return false;
  }

  canViewTopic(user: IUser, topic: ITopic): boolean {
    return true;
  }
}
