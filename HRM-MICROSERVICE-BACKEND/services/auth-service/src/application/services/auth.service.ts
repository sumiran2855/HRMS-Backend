import { injectable, inject } from "inversify";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IPasswordService } from "./password.service";
import { IJwtService } from "./jwt.service";

export interface IAuthService {
  register(
    email: string,
    username: string,
    password: string,
    fullName: string
  ): Promise<any>;
  login(email: string, password: string): Promise<any>;
  validateToken(token: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  getCurrentUser(userId: string): Promise<any>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("PasswordService") private passwordService: IPasswordService,
    @inject("JwtService") private jwtService: IJwtService
  ) {}

  async register(
    email: string,
    username: string,
    password: string,
    fullName: string
  ): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const user = await this.userRepository.create({
      email,
      username,
      password,
      fullName,
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    const accessToken = this.jwtService.generateToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

    return {
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    const accessToken = this.jwtService.generateToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

    return {
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("Invalid or expired refresh token");
    }
    const newAccessToken = this.jwtService.generateToken({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    });
    return { accessToken: newAccessToken };
  }

  async validateToken(token: string): Promise<any> {
    const payload = this.jwtService.verifyToken(token);
    if (!payload) {
      throw new Error("Invalid or expired token");
    }
    return payload;
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
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
