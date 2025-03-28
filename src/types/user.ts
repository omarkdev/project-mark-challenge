import { Prisma } from '@prisma/client';

export type UserCreateInputWithPassword = Omit<Prisma.UserCreateInput, 'password'> & {
  password: string;
};

export type UserUpdateInputWithPassword = Omit<Prisma.UserUpdateInput, 'password'> & {
  password?: string;
};
