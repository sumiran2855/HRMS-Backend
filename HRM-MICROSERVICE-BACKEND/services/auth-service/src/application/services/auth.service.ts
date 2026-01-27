import { injectable, inject } from "inversify";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IPasswordService } from "./password.service";
import { IJwtService } from "./jwt.service";
import { RoleService } from "./role.service";
import { RoleEnum } from "../../domain/entities/Role.entity";
import { ITokenBlacklistService } from "./token-blacklist.service";

export interface IAuthService {
  register(
    email: string,
    // username: string,
    password: string,
    fullName: string,
    role?: string
  ): Promise<any>;
  login(email: string, password: string): Promise<any>;
  logout(token: string, userId: string): Promise<void>;
  validateToken(token: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  getCurrentUser(userId: string): Promise<any>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("PasswordService") private passwordService: IPasswordService,
    @inject("JwtService") private jwtService: IJwtService,
    @inject(RoleService) private roleService: RoleService,
    @inject("TokenBlacklistService")
    private tokenBlacklistService: ITokenBlacklistService
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
    role: string,
  ): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // const existingUsername = await this.userRepository.findByUsername(username);
    // if (existingUsername) {
    //   throw new Error("Username already taken");
    // }

    const userRole = await this.roleService.getRoleByName(role);
    if (!userRole) {
      throw new Error(`Invalid role: ${role}`);
    }

    const user = await this.userRepository.create({
      email,
      // username,
      password,
      fullName,
      role: userRole.name,
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      organizationId: "default",
      role: userRole.name,
      permissions: userRole.permissions,
    };
    
    const accessToken = this.jwtService.generateToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

    return {
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: userRole.name,
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

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    const [isPasswordValid, userRole] = await Promise.all([
      user.comparePassword(password),
      this.roleService.getRoleByName(user.role || RoleEnum.EMPLOYEE)
    ]);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    if (!userRole) {
      throw new Error("User role not found");
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      organizationId: "default",
      role: userRole.name,
      permissions: userRole.permissions,
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.jwtService.generateToken(tokenPayload)),
      Promise.resolve(this.jwtService.generateRefreshToken(tokenPayload))
    ]);

    return {
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: userRole.name,
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
    const userRole = await this.roleService.getRoleByName(payload.role || RoleEnum.EMPLOYEE);
    const newAccessToken = this.jwtService.generateToken({
      userId: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
      permissions: userRole?.permissions || [],
    });
    return { accessToken: newAccessToken };
  }

  async validateToken(token: string): Promise<any> {
    const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new Error("Token has been revoked. Please login again.");
    }

    const payload = this.jwtService.verifyToken(token);
    if (!payload) {
      throw new Error("Invalid or expired token");
    }
    return payload;
  }

  async logout(token: string, userId: string): Promise<void> {
    try {
      await this.tokenBlacklistService.blacklistToken(token, userId);
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
    };
  }
}
