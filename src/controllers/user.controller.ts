import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  getUserByEmail = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Email already in use') {
          return res.status(409).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.deleteUser(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
}
