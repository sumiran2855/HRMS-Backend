import { AuthService } from "./auth.service";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IPasswordService } from "./password.service";
import { IJwtService } from "./jwt.service";

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<IPasswordService>;
  let mockJwtService: jest.Mocked<IJwtService>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPasswordService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    mockJwtService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    authService = new AuthService(
      mockUserRepository,
      mockPasswordService,
      mockJwtService
    );
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        fullName: "Test User",
      };

      const createdUser = {
        _id: "123",
        ...userData,
        isActive: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser as any);
      mockJwtService.generateToken.mockReturnValue("token123");

      const result = await authService.register(
        userData.email,
        userData.username,
        userData.password,
        userData.fullName
      );

      expect(result.token).toBe("token123");
      expect(result.user.email).toBe(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("should throw error if user already exists", async () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        fullName: "Test User",
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@example.com",
      } as any);

      await expect(
        authService.register(
          userData.email,
          userData.username,
          userData.password,
          userData.fullName
        )
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const user = {
        _id: "123",
        email: "test@example.com",
        username: "testuser",
        fullName: "Test User",
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findByEmail.mockResolvedValue(user as any);
      mockJwtService.generateToken.mockReturnValue("token123");

      const result = await authService.login("test@example.com", "password123");

      expect(result.token).toBe("token123");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw error for invalid credentials", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("test@example.com", "password123")
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
