import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user';


export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user: IUser | null = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive' });
      }
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as IUser;
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        message: `Role ${user.role} is not authorized to access this route`,
      });
    }
    next();
  }
};