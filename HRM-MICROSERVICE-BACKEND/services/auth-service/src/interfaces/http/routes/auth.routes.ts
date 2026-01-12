import { Container } from 'inversify';
import express from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { createAuthMiddleware } from '../middleware/auth.middleware';

export function registerAuthRoutes(app: express.Application, container: Container): void {
  app.get('/health', (req, res) => {
    res.json({ status: 'Auth Service is running' });
  });

  app.post('/register', async (req, res) => {
    const authController = container.get(AuthController);
    await authController.register(req, res);
  });

  app.post('/login', async (req, res) => {
    const authController = container.get(AuthController);
    await authController.login(req, res);
  });

  app.get('/validate-token', async (req, res) => {
    const authController = container.get(AuthController);
    await authController.validateToken(req, res);
  });

  app.get('/current-user',async (req, res) => {
    const authController = container.get(AuthController);
    await authController.getCurrentUser(req, res);
  });
}