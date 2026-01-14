import { Container } from 'inversify';
import express, { Router, Request, Response } from 'express';
import { EmployeeController } from '../controllers/Employee.controller';

export function registerEmployeeRoutes(app: express.Application, container: Container): void {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next) => {
    try {
      const employeeController = container.get(EmployeeController);
      await employeeController.createEmployee(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req: Request, res: Response, next) => {
    try {
      const employeeController = container.get(EmployeeController);
      await employeeController.getAllEmployees(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next) => {
    try {
      const employeeController = container.get(EmployeeController);
      await employeeController.getEmployeeById(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next) => {
    try {
      const employeeController = container.get(EmployeeController);
      await employeeController.updateEmployee(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next) => {
    try {
      const employeeController = container.get(EmployeeController);
      await employeeController.deleteEmployee(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/employees', router);
}
