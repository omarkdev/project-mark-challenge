import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/auth.service';
import { IUser, IUserLoginInput, IUserRegisterInput } from '../../src/interfaces/user.interface';

// Mock external dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaUser: any;

  const mockUser: IUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Prisma mock
    mockPrismaUser = {
      findUnique: jest.fn(),
      create: jest.fn(),
    };
    (PrismaClient as jest.Mock).mockImplementation(() => ({
      user: mockPrismaUser,
    }));

    authService = new AuthService();
  });

  describe('login', () => {
    const loginInput: IUserLoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user with valid credentials', async () => {
      // Mock dependencies
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await authService.login(loginInput);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: 'mockToken',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('should throw error when user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow('User not found');
    });

    it('should throw error when password is invalid', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid password');
    });
  });

  describe('register', () => {
    const registerInput: IUserRegisterInput = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'viewer',
    };

    it('should successfully register a new user', async () => {
      // Mock dependencies
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaUser.create.mockResolvedValue({
        ...mockUser,
        name: registerInput.name,
        email: registerInput.email,
      });

      const result = await authService.register(registerInput);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: {
          name: registerInput.name,
          email: registerInput.email,
          password: 'hashedPassword',
          role: registerInput.role,
        },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('name', registerInput.name);
      expect(result).toHaveProperty('email', registerInput.email);
    });

    it('should throw error when user already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(authService.register(registerInput)).rejects.toThrow('User already exists');
    });

    it('should throw error when invalid role is provided', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      const invalidInput = { ...registerInput, role: 'invalid_role' };

      await expect(authService.register(invalidInput)).rejects.toThrow(/Invalid role/);
    });

    it('should use default role when role is not provided', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const inputWithoutRole = { ...registerInput };
      delete inputWithoutRole.role;

      mockPrismaUser.create.mockResolvedValue({
        ...mockUser,
        name: inputWithoutRole.name,
        email: inputWithoutRole.email,
        role: 'viewer',
      });

      const result = await authService.register(inputWithoutRole);

      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: {
          name: inputWithoutRole.name,
          email: inputWithoutRole.email,
          password: 'hashedPassword',
          role: 'viewer',
        },
      });
      expect(result.role).toBe('viewer');
    });
  });
});
