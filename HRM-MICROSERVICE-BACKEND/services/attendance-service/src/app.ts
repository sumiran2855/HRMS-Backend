import "reflect-metadata";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { container } from "./bootstrap/container.bootstrap";
import { attendanceRoutes } from "./interface/http/routes/attendance.routes";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";
import { ErrorHandler } from "./shared/utils/error-handler.util";
import { ResponseFormatter } from "./shared/utils/response-formatter.util";

const logger = new Logger("AppBootstrap");

// Mock auth middleware (in production, integrate with auth service)
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // For development, extract from header or use mock user
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // In production, verify JWT token here
    (req as any).user = {
      userId: (req.headers["x-user-id"] as string) || "test-user",
      organizationId: (req.headers["x-org-id"] as string) || "test-org",
      email: (req.headers["x-user-email"] as string) || "test@example.com",
    };
  }
  
  next();
};

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-ID", "X-Org-ID", "X-User-Email"],
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Request timing middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      console.log(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  });

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    (req as any).id = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
  });

  // Health check endpoints
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "attendance-service",
      timestamp: new Date().toISOString(),
      environment: envConfig.nodeEnv,
    });
  });

  app.get("/ready", (req: Request, res: Response) => {
    res.json({
      ready: true,
      service: "attendance-service",
      timestamp: new Date().toISOString(),
    });
  });

  // Apply auth middleware
  app.use(authMiddleware);

  // Register attendance routes
  logger.info("Registering Attendance routes...");
  app.use("/api/attendance", attendanceRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    const error = {
      status: 404,
      message: "Route not Found",
      path: req.originalUrl,
      method: req.method,
    };
    logger.warn(`404: ${req.method} ${req.originalUrl}`);

    res.status(404).json(ResponseFormatter.error(error.message, 404));
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handle(err, req, res, logger);
  });

  logger.info("Application configured successfully");
  return app;
}
