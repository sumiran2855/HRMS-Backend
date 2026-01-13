import "reflect-metadata";
import { Container } from "inversify";
import {
  UserRepository,
  IUserRepository,
} from "../domain/repositories/user.repository";
import {
  PasswordService,
  IPasswordService,
} from "../application/services/password.service";
import { JwtService, IJwtService } from "../application/services/jwt.service";
import {
  AuthService,
  IAuthService,
} from "../application/services/auth.service";
import { AuthController } from "../interfaces/http/controllers/Auth.controller";

/**
 * Container Bootstrap
 * Configures Inversify IoC container with all dependencies
 */
export function buildContainer(): Container {
  const container = new Container();

  // ========== REPOSITORIES ==========
  container
    .bind<IUserRepository>("UserRepository")
    .to(UserRepository)
    .inSingletonScope();

  // ========== DOMAIN SERVICES ==========
  container
    .bind<IPasswordService>("PasswordService")
    .to(PasswordService)
    .inSingletonScope();
  container.bind<IJwtService>("JwtService").to(JwtService).inSingletonScope();

  // ========== APPLICATION SERVICES ==========
  container
    .bind<IAuthService>("AuthService")
    .to(AuthService)
    .inSingletonScope();

  // ========== CONTROLLERS ==========
  container.bind<AuthController>(AuthController).toSelf();

  return container;
}

// Export singleton container instance
export const container = buildContainer();
