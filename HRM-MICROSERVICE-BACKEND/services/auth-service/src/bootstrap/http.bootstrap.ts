/**
 * DEPRECATED: This file has been refactored into app.ts
 *
 * This bootstrap file was previously responsible for:
 * - Creating Express application
 * - Setting up middleware
 * - Registering routes
 * - Starting the HTTP server
 *
 * All these responsibilities have been moved to:
 * - app.ts: Application factory and configuration
 * - server.ts: Server bootstrap and startup
 *
 * Please use the new structure:
 * 1. Import createApp from app.ts
 * 2. Call initializeDatabase() from db.bootstrap.ts
 * 3. Call app.listen() from server.ts
 */

import "reflect-metadata";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { buildContainer } from "./container.bootstrap";
import { registerAuthRoutes } from "../interfaces/http/routes/auth.routes";
import { envConfig } from "../config/env.config";

/**
 * DEPRECATED: Use createApp from app.ts instead
 */
export function startHttpServer(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const container = buildContainer();

  registerAuthRoutes(app, container);

  const port = envConfig.port || 3001;
  app.listen(port, () => {
    console.log(`Auth Service is running on port ${port}`);
  });

  return app;
}
