import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { IAuthService } from '../../../application/services/auth.service';
import { LoginRequest, RegisterRequest } from '../../dtos/auth.dto';

@injectable()
export class AuthController {
  constructor(@inject('AuthService') private authService: IAuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    console.log("🚀 ~ AuthController ~ register ~ req:", req.body)
    try {
      const { email, username, password, fullName } = req.body as RegisterRequest;

      if (!email || !username || !password || !fullName) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const result = await this.authService.register(email, username, password, fullName);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const payload = await this.authService.validateToken(token);
      res.status(200).json({ valid: true, payload });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      console.log("🚀 ~ AuthController ~ getCurrentUser ~ userId:", userId)
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await this.authService.getCurrentUser(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
