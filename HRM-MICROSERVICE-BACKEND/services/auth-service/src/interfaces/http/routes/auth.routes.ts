import { Container } from "inversify";
import express, { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/Auth.controller";
import {
  authMiddleware,
} from "../middleware/auth.middleware";
import {
  validateRequestBody,
  trimRequestBody,
} from "../middleware/validation.middleware";
import { tokenBlacklistCheckMiddleware } from "../../../shared/middleware/token-blacklist.middleware";
import { Logger } from "../../../shared/utils/logger.util";

const logger = new Logger("AuthRoutes");

export function registerAuthRoutes(
  app: express.Application,
  container: Container
): void {
  const router = Router();

  router.post(
    "/register",
    trimRequestBody,
    validateRequestBody(["email", "username", "password", "fullName","role"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.register(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/login",
    trimRequestBody,
    validateRequestBody(["email", "password"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.login(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/refresh-token",
    trimRequestBody,
    validateRequestBody(["refreshToken"]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.refreshToken(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/validate-token",
    tokenBlacklistCheckMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      authMiddleware(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.validateToken(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/current-user",
    tokenBlacklistCheckMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      authMiddleware(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.getCurrentUser(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/logout",
    tokenBlacklistCheckMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      authMiddleware(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authController = container.get<AuthController>(AuthController);
        await authController.logout(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use("/auth", router);
  logger.info("✓ Auth routes registered successfully");
}
