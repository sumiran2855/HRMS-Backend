import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { IEmployeeService } from '../../../application/services/employee.service';
import { ResponseFormatter } from '../../../shared/utils/response-formatter.util';
import { Logger } from '../../../shared/utils/logger.util';
import { AppError } from '../../../shared/utils/error-handler.util';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../shared/constants/messages.constant';

@injectable()
export class EmployeeController {
  private logger = new Logger('EmployeeController');

  constructor(@inject('EmployeeService') private employeeService: IEmployeeService) {}

  async createEmployee(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Creating employee`);

      const result = await this.employeeService.createEmployee(req.body);

      this.logger.info(`[${requestId}] Employee created successfully`);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFormatter.success(result, SUCCESS_MESSAGES.RESOURCE_CREATED, HTTP_STATUS.CREATED)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Create error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.BAD_REQUEST);

      throw appError;
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Getting all employees`);

      const employees = await this.employeeService.getAllEmployees();

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(employees, SUCCESS_MESSAGES.RESOURCE_FETCHED, HTTP_STATUS.OK)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Fetch error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      throw appError;
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;
    const { id } = req.params;

    try {
      this.logger.debug(`[${requestId}] Getting employee:`, id);

      const employee = await this.employeeService.getEmployeeById(id);

      if (!employee) {
        throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(employee, SUCCESS_MESSAGES.RESOURCE_FETCHED, HTTP_STATUS.OK)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Fetch error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      throw appError;
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;
    const { id } = req.params;

    try {
      this.logger.debug(`[${requestId}] Updating employee:`, id);

      const employee = await this.employeeService.updateEmployee(id, req.body);

      if (!employee) {
        throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(employee, SUCCESS_MESSAGES.RESOURCE_UPDATED, HTTP_STATUS.OK)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Update error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      throw appError;
    }
  }

  async deleteEmployee(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;
    const { id } = req.params;

    try {
      this.logger.debug(`[${requestId}] Deleting employee:`, id);

      const success = await this.employeeService.deleteEmployee(id);

      if (!success) {
        throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success({ id }, SUCCESS_MESSAGES.RESOURCE_DELETED, HTTP_STATUS.OK)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Delete error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      throw appError;
    }
  }
}
