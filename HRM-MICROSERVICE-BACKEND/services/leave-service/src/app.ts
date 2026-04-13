import "reflect-metadata";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { Container } from "inversify";
import { registerLeaveRoutes } from "./interfaces/http/routes/leave.routes";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";
import { ResponseFormatter } from "./shared/utils/response-formatter.util";

const logger = new Logger("AppBootstrap");

export function createApp(container: Container): Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    (req as any).id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  });

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      service: "leave-service",
      timestamp: new Date().toISOString(),
    });
  });

  // Register routes
  registerLeaveRoutes(app, container);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json(
      ResponseFormatter.error("Route not found", 404, {
        path: req.originalUrl,
      })
    );
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(`[${(req as any).id}] Error:`, err);

    res.status(statusCode).json(
      ResponseFormatter.error(message, statusCode, {
        details: envConfig.nodeEnv === "development" ? err.stack : undefined,
      })
    );
  });

  return app;
}
