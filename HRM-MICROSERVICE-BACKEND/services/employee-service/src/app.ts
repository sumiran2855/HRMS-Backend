import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Container } from 'inversify';
import { Logger } from './shared/utils/logger.util';
import { ErrorHandler } from './shared/utils/error-handler.util';
import { ResponseFormatter } from './shared/utils/response-formatter.util';
import { registerEmployeeRoutes } from './interfaces/http/routes/employee.routes';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('App');

export function createApp(container?: Container): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use((req, res, next) => {
    (req as any).id = uuidv4();
    logger.info(`[${(req as any).id}] ${req.method} ${req.path}`);
    next();
  });

  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.info(`[${(req as any).id}] ${req.method} ${req.path} ${res.statusCode}`);
    });
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'employee-service' });
  });

  app.get('/ready', (req, res) => {
    res.json({ status: 'READY', service: 'employee-service' });
  });

  if (container) {
    registerEmployeeRoutes(app, container);
  }

  app.use((req, res) => {
    res.status(404).json(
      ResponseFormatter.error('Route not found', 404)
    );
  });

  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`[${(req as any).id}] Error:`, error);
    ErrorHandler.handle(error, res);
  });

  return app;
}
