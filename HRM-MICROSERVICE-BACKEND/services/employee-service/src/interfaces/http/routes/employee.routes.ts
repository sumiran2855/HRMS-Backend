import { Container } from 'inversify';
import express, { Router, Request, Response, NextFunction } from 'express';
import { EmployeeController } from '../controllers/Employee.controller';
import { authMiddleware, requirePermission, AuthRequest } from '../../../shared/middleware/auth.middleware';
import { PermissionEnum } from '../../../domain/entities/Role.entity';

export function registerEmployeeRoutes(app: express.Application, container: Container): void {
  const router = Router();

  router.post('/', (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next), 
    requirePermission(PermissionEnum.CREATE_EMPLOYEE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const employeeController = container.get(EmployeeController);
        await employeeController.createEmployee(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get('/', (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_EMPLOYEE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const employeeController = container.get(EmployeeController);
        await employeeController.getAllEmployees(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get('/:id', (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_EMPLOYEE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const employeeController = container.get(EmployeeController);
        await employeeController.getEmployeeById(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put('/:id', (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.UPDATE_EMPLOYEE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const employeeController = container.get(EmployeeController);
        await employeeController.updateEmployee(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete('/:id', (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.DELETE_EMPLOYEE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const employeeController = container.get(EmployeeController);
        await employeeController.deleteEmployee(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use('/api/employees', router);
}
