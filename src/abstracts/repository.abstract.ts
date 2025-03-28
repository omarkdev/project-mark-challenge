import { IEntity } from '../interfaces/entity.interface';
import { PrismaClient } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';

export abstract class Repository<T extends IEntity> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = new PrismaClient();
  }

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Omit<T, keyof IEntity> & { user: IUser }): Promise<T>;
  abstract update(id: string, data: Partial<Omit<T, keyof IEntity>> & { user: IUser }): Promise<T>;
  abstract delete(id: string, user: IUser): Promise<T>;
}
