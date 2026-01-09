import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User,{IUser} from '../models/user';

interface AuthRequest extends Request {
  user?: { id: string };
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Partial<IUser>;
  message?: string;
  error?: string;
}

const JWT_EXPIRY = '24h';
const BCRYPT_ROUNDS = 12;

export const generateToken = (userId: string): string => {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: SignOptions = { expiresIn: JWT_EXPIRY };
  return jwt.sign(payload, secret, options);
};

export const register = async (
  req: Request,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    console.log("🚀 ~ register ~  email, password, role:",  email, password, role)

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const newUser = new User({
      email: email.toLowerCase(),
      password,
      role: role || 'employee',
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const login = async (
  req: Request,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const existingUser = await User.findOne({ email }).populate('employee');
    if (!existingUser) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (!existingUser.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
      return;
    }

    existingUser.lastLogin = new Date();
    await existingUser.save();

    const token = generateToken(existingUser._id.toString());

    res.json({
      success: true,
      token,
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        employee: existingUser.employee,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const currentUser = await User.findById(req.user.id)
      .select('-password')
      .populate('employee');

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const isMatch = await currentUser.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    currentUser.password = newPassword;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};