import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserService } from '../../src/services/user.service';
import { UserCreateInputWithPassword, UserUpdateInputWithPassword } from '../../src/types/user';

// Mock external dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;
  let mockPrismaUser: any;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrismaUser = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (PrismaClient as jest.Mock).mockImplementation(() => ({
      user: mockPrismaUser,
    }));

    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      mockPrismaUser.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockPrismaUser.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById('999');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail('test@example.com');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await userService.getUserByEmail('nonexistent@example.com');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    const createUserInput: UserCreateInputWithPassword = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'viewer',
    };

    it('should create a new user successfully', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaUser.create.mockResolvedValue({ ...mockUser, ...createUserInput });

      const result = await userService.createUser(createUserInput);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: createUserInput.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserInput.password, 10);
      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: {
          ...createUserInput,
          password: 'hashedPassword',
        },
      });
      expect(result).toEqual({ ...mockUser, ...createUserInput });
    });

    it('should throw error when email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(userService.createUser(createUserInput))
        .rejects.toThrow('User with this email already exists');

      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateUserInput: UserUpdateInputWithPassword = {
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newpassword123',
    };

    it('should update user successfully', async () => {
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(mockUser) // First call for user existence
        .mockResolvedValueOnce(null);    // Second call for email check
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaUser.update.mockResolvedValue({ ...mockUser, ...updateUserInput });

      const result = await userService.updateUser('1', updateUserInput);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserInput.password, 10);
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateUserInput.name,
          email: updateUserInput.email,
          password: 'newHashedPassword',
        },
      });
      expect(result).toEqual({ ...mockUser, ...updateUserInput });
    });

    it('should throw error when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(userService.updateUser('999', updateUserInput))
        .rejects.toThrow('User not found');

      expect(mockPrismaUser.update).not.toHaveBeenCalled();
    });

    it('should throw error when new email is already in use', async () => {
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(mockUser) // First call for user existence
        .mockResolvedValueOnce({ ...mockUser, id: '2' }); // Second call finds different user with same email

      await expect(userService.updateUser('1', updateUserInput))
        .rejects.toThrow('Email already in use');

      expect(mockPrismaUser.update).not.toHaveBeenCalled();
    });

    it('should update user without password when not provided', async () => {
      const updateWithoutPassword = { name: 'Updated Name' };
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaUser.update.mockResolvedValue({ ...mockUser, ...updateWithoutPassword });

      const result = await userService.updateUser('1', updateWithoutPassword);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateWithoutPassword,
      });
      expect(result).toEqual({ ...mockUser, ...updateWithoutPassword });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockPrismaUser.delete.mockResolvedValue(mockUser);

      const result = await userService.deleteUser('1');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaUser.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(userService.deleteUser('999'))
        .rejects.toThrow('User not found');

      expect(mockPrismaUser.delete).not.toHaveBeenCalled();
    });
  });
});
