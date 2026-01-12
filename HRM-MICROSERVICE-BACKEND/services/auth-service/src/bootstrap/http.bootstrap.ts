import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { buildContainer } from './container.bootstrap';
import { registerAuthRoutes } from '../interfaces/http/routes/auth.routes';
import { envConfig } from '../config/env.config';

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
