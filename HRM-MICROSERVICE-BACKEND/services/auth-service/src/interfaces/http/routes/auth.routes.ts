import { Container } from "inversify";
import express, { Router, Request, Response } from "express";
import { AuthController } from "../controllers/Auth.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";
import {
  validateRequestBody,
  trimRequestBody,
} from "../middleware/validation.middleware";

export function registerAuthRoutes(
  app: express.Application,
  container: Container
): void {
  const router = Router();

  router.post(
    "/register",
    trimRequestBody,
    validateRequestBody(["email", "username", "password", "fullName"]),
    async (req: Request, res: Response, next) => {
      try {
        const authController = container.get(AuthController);
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
    async (req: Request, res: Response, next) => {
      try {
        const authController = container.get(AuthController);
        await authController.login(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post("/validate-token", async (req: Request, res: Response, next) => {
    try {
      const authController = container.get(AuthController);
      await authController.validateToken(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get(
    "/current-user",
    authMiddleware,
    async (req: Request, res: Response, next) => {
      try {
        const authController = container.get(AuthController);
        await authController.getCurrentUser(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/logout",
    authMiddleware,
    async (req: Request, res: Response, next) => {
      try {
        const authController = container.get(AuthController);
        await authController.logout(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/refresh-token",
    optionalAuthMiddleware,
    async (req: Request, res: Response, next) => {
      try {
        const authController = container.get(AuthController);
        await authController.refreshToken(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use("/api/auth", router);
}
