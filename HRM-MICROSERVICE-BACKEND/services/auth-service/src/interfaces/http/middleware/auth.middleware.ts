import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';
import { IJwtService } from '../../../application/services/jwt.service';

export function createAuthMiddleware(container: Container) {
  console.log("🚀 ~ createAuthMiddleware ~ container:", container)
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("🚀 ~ createAuthMiddleware ~ token:", req.headers.authorization)
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token is required' });
      }

      const jwtService = container.get<IJwtService>('JwtService');
      const payload = jwtService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      (req as any).user = payload;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;