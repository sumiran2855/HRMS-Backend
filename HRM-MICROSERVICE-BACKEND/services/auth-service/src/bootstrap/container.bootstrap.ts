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

export function buildContainer(): Container {
  const container = new Container();

  container
    .bind<IUserRepository>("UserRepository")
    .to(UserRepository)
    .inSingletonScope();

  container
    .bind<IPasswordService>("PasswordService")
    .to(PasswordService)
    .inSingletonScope();
  container.bind<IJwtService>("JwtService").to(JwtService).inSingletonScope();

  container
    .bind<IAuthService>("AuthService")
    .to(AuthService)
    .inSingletonScope();

  container.bind<AuthController>(AuthController).toSelf();

  return container;
}

export const container = buildContainer();
