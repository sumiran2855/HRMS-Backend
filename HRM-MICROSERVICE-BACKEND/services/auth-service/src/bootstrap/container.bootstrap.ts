import "reflect-metadata";
import { Container } from "inversify";
import {
  UserRepository,
  IUserRepository,
} from "../domain/repositories/user.repository";
import {
  RoleRepository,
  IRoleRepository,
} from "../domain/repositories/role.repository";
import {
  PasswordService,
  IPasswordService,
} from "../application/services/password.service";
import { JwtService, IJwtService } from "../application/services/jwt.service";
import {
  AuthService,
  IAuthService,
} from "../application/services/auth.service";
import { RoleService } from "../application/services/role.service";
import {
  TokenBlacklistService,
  ITokenBlacklistService,
} from "../application/services/token-blacklist.service";
import {
  TokenBlacklistRepository,
  ITokenBlacklistRepository,
} from "../infrastructure/persistence/token-blacklist.repository";
import { AuthController } from "../interfaces/http/controllers/Auth.controller";
import { AuthGrpcImpl } from "../infrastructure/grpc/auth.grpc.impl";
import { EmployeeGrpcClient } from "../infrastructure/grpc/employee.grpc.client";

export function buildContainer(): Container {
  const container = new Container();

  container
    .bind<IUserRepository>("UserRepository")
    .to(UserRepository)
    .inSingletonScope();

  container
    .bind<IRoleRepository>("RoleRepository")
    .to(RoleRepository)
    .inSingletonScope();

  container
    .bind<ITokenBlacklistRepository>("TokenBlacklistRepository")
    .to(TokenBlacklistRepository)
    .inSingletonScope();

  container
    .bind<IPasswordService>("PasswordService")
    .to(PasswordService)
    .inSingletonScope();
  container.bind<IJwtService>("JwtService").to(JwtService).inSingletonScope();

  container
    .bind<ITokenBlacklistService>("TokenBlacklistService")
    .to(TokenBlacklistService)
    .inSingletonScope();

  container
    .bind<IAuthService>("AuthService")
    .to(AuthService)
    .inSingletonScope();

  container
    .bind<RoleService>(RoleService)
    .toSelf()
    .inSingletonScope();

  container.bind<AuthController>(AuthController).toSelf();

  container
    .bind<EmployeeGrpcClient>(EmployeeGrpcClient)
    .toSelf()
    .inSingletonScope();

  container
    .bind<AuthGrpcImpl>(AuthGrpcImpl)
    .toSelf()
    .inSingletonScope();

  return container;
}

export const container = buildContainer();
