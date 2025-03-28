import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserCreateInputWithPassword, UserUpdateInputWithPassword } from '../types/user';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async createUser(data: UserCreateInputWithPassword): Promise<User> {
    const { email, password, ...rest } = data;

    // Check if user with email already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...rest
      }
    });
  }

  async updateUser(
    id: string,
    data: UserUpdateInputWithPassword
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      // Check if new email is already taken
      const existingUser = await this.getUserByEmail(data.email as string);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // If password is being updated, hash it
    const { password, ...rest } = data;
    const updateData = { ...rest };

    if (password) {
      Object.assign(updateData, { password: await bcrypt.hash(password, 10) });
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.user.delete({
      where: { id }
    });
  }
}
