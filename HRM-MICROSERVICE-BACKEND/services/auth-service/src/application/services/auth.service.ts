import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordService } from './password.service';
import { IJwtService } from './jwt.service';

export interface IAuthService {
  register(email: string, username: string, password: string, fullName: string): Promise<any>;
  login(email: string, password: string): Promise<any>;
  validateToken(token: string): Promise<any>;
  getCurrentUser(userId: string): Promise<any>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('PasswordService') private passwordService: IPasswordService,
    @inject('JwtService') private jwtService: IJwtService
  ) {}

  async register(email: string, username: string, password: string, fullName: string): Promise<any> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create new user
    const user = await this.userRepository.create({
      email,
      username,
      password,
      fullName,
    });

    // Generate token
    const token = this.jwtService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<any> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Generate token
    const token = this.jwtService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      token,
    };
  }

  async validateToken(token: string): Promise<any> {
    const payload = this.jwtService.verifyToken(token);
    if (!payload) {
      throw new Error('Invalid or expired token');
    }
    return payload;
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      isActive: user.isActive,
    };
  }
}
