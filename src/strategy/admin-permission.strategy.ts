import { IPermissionStrategy } from './permission-strategy.interface';
import { ITopic } from '../interfaces/topic.interface';
import { IUser, UserRole } from '../interfaces/user.interface';

export class AdminPermissionStrategy implements IPermissionStrategy {
  canCreateTopic(user: IUser): boolean {
    return user.role === UserRole.ADMIN;
  }

  canEditTopic(user: IUser, topic: ITopic): boolean {
    return user.role === UserRole.ADMIN;
  }

  canDeleteTopic(user: IUser, topic: ITopic): boolean {
    return user.role === UserRole.ADMIN;
  }

  canViewTopic(user: IUser, topic: ITopic): boolean {
    return true;
  }
}
