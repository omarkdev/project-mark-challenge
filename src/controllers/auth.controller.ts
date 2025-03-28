import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { IUserLoginInput, IUserRegisterInput } from '../interfaces/user.interface';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const loginInput: IUserLoginInput = { email, password };
      const result = await this.authService.login(loginInput);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error.message === 'Invalid password') {
          res.status(401).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password, and name are required' });
        return;
      }

      const registerInput: IUserRegisterInput = { email, password, name, role };
      const user = await this.authService.register(registerInput);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          res.status(409).json({ message: error.message });
          return;
        }
        if (error.message.startsWith('Invalid role')) {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
