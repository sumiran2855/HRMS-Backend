import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { ILeaveService } from "../../../application/services/leave.service";
import { ILeaveBalanceService } from "../../../application/services/leave-balance.service";
import { ILeaveTypeService } from "../../../application/services/leave-type.service";
import { ResponseFormatter } from "../../../shared/utils/response-formatter.util";
import { Logger } from "../../../shared/utils/logger.util";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../../../shared/constants/messages.constant";
import { AppError } from "../../../shared/utils/error-handler.util";
import {
  CreateLeaveRequest,
  ApproveLeaveRequest,
  RejectLeaveRequest,
} from "../../dtos/leave.dto";

@injectable()
export class LeaveController {
  private logger = new Logger("LeaveController");

  constructor(
    @inject("LeaveService") private leaveService: ILeaveService,
    @inject("LeaveBalanceService") private leaveBalanceService: ILeaveBalanceService,
    @inject("LeaveTypeService") private leaveTypeService: ILeaveTypeService
  ) {}

  async requestLeave(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Request leave:`, {
        employeeId: req.body.employeeId,
        leaveType: req.body.leaveType,
      });

      const {
        employeeId,
        leaveType,
        startDate,
        endDate,
        numberOfDays,
        reason,
        attachmentUrl,
      } = req.body as CreateLeaveRequest;

      if (!employeeId || !leaveType || !startDate || !endDate || !numberOfDays || !reason) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(
            ERROR_MESSAGES.VALIDATION_ERROR,
            HTTP_STATUS.BAD_REQUEST
          )
        );
        return;
      }

      const leave = await this.leaveService.requestLeave(
        employeeId,
        leaveType,
        new Date(startDate),
        new Date(endDate),
        numberOfDays,
        reason,
        attachmentUrl
      );

      this.logger.info(`[${requestId}] Leave requested: ${leave._id}`);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFormatter.success(
          leave,
          SUCCESS_MESSAGES.LEAVE_REQUESTED,
          HTTP_STATUS.CREATED
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async getLeavesByEmployeeId(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { employeeId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!employeeId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leaves = await this.leaveService.getLeavesByEmployeeId(
        employeeId,
        page,
        limit
      );

      this.logger.info(`[${requestId}] Retrieved leaves for employee: ${employeeId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leaves,
          SUCCESS_MESSAGES.LEAVES_RETRIEVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async getLeaveById(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { leaveId } = req.params;

      if (!leaveId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leave = await this.leaveService.getLeaveById(leaveId);

      this.logger.info(`[${requestId}] Retrieved leave: ${leaveId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leave,
          SUCCESS_MESSAGES.LEAVE_RETRIEVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async getAllLeaves(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const leaves = await this.leaveService.getAllLeaves(page, limit);

      this.logger.info(`[${requestId}] Retrieved all leaves`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leaves,
          SUCCESS_MESSAGES.LEAVES_RETRIEVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async approveLeave(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { leaveId } = req.params;
      const { approvedBy } = req.body as ApproveLeaveRequest;

      if (!leaveId || !approvedBy) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leave = await this.leaveService.approveLeave(leaveId, approvedBy);

      this.logger.info(`[${requestId}] Leave approved: ${leaveId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leave,
          SUCCESS_MESSAGES.LEAVE_APPROVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async rejectLeave(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { leaveId } = req.params;
      const { rejectionReason } = req.body as RejectLeaveRequest;

      if (!leaveId || !rejectionReason) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leave = await this.leaveService.rejectLeave(leaveId, rejectionReason);

      this.logger.info(`[${requestId}] Leave rejected: ${leaveId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leave,
          SUCCESS_MESSAGES.LEAVE_REJECTED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async cancelLeave(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { leaveId } = req.params;

      if (!leaveId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leave = await this.leaveService.cancelLeave(leaveId);

      this.logger.info(`[${requestId}] Leave cancelled: ${leaveId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          leave,
          SUCCESS_MESSAGES.LEAVE_CANCELLED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async getLeaveBalance(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { employeeId } = req.params;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      if (!employeeId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const balance = await this.leaveBalanceService.getBalance(employeeId, year);

      this.logger.info(`[${requestId}] Retrieved balance for employee: ${employeeId}`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          balance,
          SUCCESS_MESSAGES.BALANCE_RETRIEVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async initializeLeaveBalance(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { employeeId, year } = req.body;

      if (!employeeId || !year) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const balance = await this.leaveBalanceService.initializeBalance(
        employeeId,
        year
      );

      this.logger.info(`[${requestId}] Balance initialized for employee: ${employeeId}`);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFormatter.success(
          balance,
          SUCCESS_MESSAGES.BALANCE_INITIALIZED,
          HTTP_STATUS.CREATED
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async getAllLeaveTypes(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const types = await this.leaveTypeService.getAllLeaveTypes(page, limit);

      this.logger.info(`[${requestId}] Retrieved all leave types`);

      res.status(HTTP_STATUS.OK).json(
        ResponseFormatter.success(
          types,
          SUCCESS_MESSAGES.LEAVE_TYPES_RETRIEVED,
          HTTP_STATUS.OK
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  async createLeaveType(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const {
        name,
        maxDaysPerYear,
        carryForwardDays,
        requiresApproval,
        requiresAttachment,
        description,
      } = req.body;

      if (!name || !maxDaysPerYear) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          ResponseFormatter.error(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST)
        );
        return;
      }

      const leaveType = await this.leaveTypeService.createLeaveType(
        name,
        maxDaysPerYear,
        carryForwardDays,
        requiresApproval,
        requiresAttachment,
        description
      );

      this.logger.info(`[${requestId}] Leave type created: ${name}`);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFormatter.success(
          leaveType,
          SUCCESS_MESSAGES.LEAVE_TYPE_CREATED,
          HTTP_STATUS.CREATED
        )
      );
    } catch (error) {
      this.handleError(error, res, requestId);
    }
  }

  private handleError(error: any, res: Response, requestId: string): void {
    const errorResponse = error instanceof AppError
      ? { statusCode: error.statusCode, message: error.message }
      : { statusCode: HTTP_STATUS.INTERNAL_ERROR, message: ERROR_MESSAGES.INTERNAL_ERROR };

    this.logger.error(`[${requestId}] Error:`, error);

    res.status(errorResponse.statusCode).json(
      ResponseFormatter.error(
        errorResponse.message,
        errorResponse.statusCode
      )
    );
  }
}
