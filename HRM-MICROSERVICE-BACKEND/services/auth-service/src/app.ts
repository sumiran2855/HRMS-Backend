import "reflect-metadata";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { container } from "./bootstrap/container.bootstrap";
import { registerAuthRoutes } from "./interfaces/http/routes/auth.routes";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";
import { ErrorHandler } from "./shared/utils/error-handler.util";
import { ResponseFormatter } from "./shared/utils/response-formatter.util";

const logger = new Logger("AppBootstrap");

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    (req as any).id = requestId;
    res.setHeader("X-Request-ID", requestId);

    next();
  });

  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "auth-service",
      timestamp: new Date().toISOString(),
      environment: envConfig.nodeEnv,
    });
  });

  app.get("/ready", (req: Request, res: Response) => {
    res.json({
      ready: true,
      service: "auth-service",
      timestamp: new Date().toISOString(),
    });
  });

  logger.info("Registering routes...");
  registerAuthRoutes(app, container);

  app.use((req: Request, res: Response) => {
    const error = {
      status: 404,
      message: "Route not found",
      path: req.originalUrl,
      method: req.method,
    };
    logger.warn(`404: ${req.method} ${req.originalUrl}`);
    res.status(404).json(ResponseFormatter.error(error.message, 404));
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handle(err, req, res, logger);
  });

  logger.info("Application configured successfully");
  return app;
}

export default createApp;
