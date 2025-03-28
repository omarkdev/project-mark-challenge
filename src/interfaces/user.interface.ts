import { IEntity } from './entity.interface';

export interface IUser extends IEntity {
  email: string;
  name: string;
  role: string;
  password: string;
}

export interface IUserWithoutPassword extends Omit<IUser, 'password'> {}

export interface IUserRegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface IUserLoginInput {
  email: string;
  password: string;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
