import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, IUserWithoutPassword, IUserRegisterInput, IUserLoginInput } from '../interfaces/user.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DEFAULT_ROLE = 'viewer';
const ALLOWED_ROLES = ['admin', 'editor', 'viewer'] as const;

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private mapToIUserWithoutPassword(user: IUser): IUserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: IUserLoginInput): Promise<{ token: string; user: IUserWithoutPassword }> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email }
    }) as IUser;

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, user: this.mapToIUserWithoutPassword(user) };
  }

  async register(data: IUserRegisterInput): Promise<IUserWithoutPassword> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const role = data.role || DEFAULT_ROLE;
    if (!ALLOWED_ROLES.includes(role as any)) {
      throw new Error(`Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role,
      }
    }) as IUser;

    return this.mapToIUserWithoutPassword(user);
  }
}
