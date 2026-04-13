import { injectable, inject } from "inversify";
import { Response } from "express";
import { AttendanceService } from "../../application/services/AttendanceService";
import {
  CreateAttendanceCommand,
  UpdateAttendanceCommand,
  DeleteAttendanceCommand,
  ApproveAttendanceCommand,
  GetAttendanceByDateRangeCommand,
  GetAttendanceSummaryCommand,
  BulkUpsertAttendanceCommand,
} from "../../application/commands/Attendance.command";
import {
  CreateAttendanceHandler,
  UpdateAttendanceHandler,
  DeleteAttendanceHandler,
  ApproveAttendanceHandler,
  GetAttendanceByDateRangeHandler,
  GetAttendanceSummaryHandler,
  BulkUpsertAttendanceHandler,
} from "../../application/handlers/Attendance.handler";
import { ResponseFormatter } from "../../shared/utils/response-formatter.util";
import { Logger } from "../../shared/utils/logger.util";
import { AppError } from "../../shared/utils/error-handler.util";
import { AuthenticatedRequest } from "../../shared/types/index";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        organizationId: string;
        email?: string;
        role?: string;
        permissions?: string[];
      };
      id?: string;
    }
  }
}

@injectable()
export class AttendanceController {
  private logger = new Logger("AttendanceController");

  constructor(
    @inject("AttendanceService") private attendanceService: AttendanceService,
    @inject(CreateAttendanceHandler)
    private createHandler: CreateAttendanceHandler,
    @inject(UpdateAttendanceHandler)
    private updateHandler: UpdateAttendanceHandler,
    @inject(DeleteAttendanceHandler)
    private deleteHandler: DeleteAttendanceHandler,
    @inject(ApproveAttendanceHandler)
    private approveHandler: ApproveAttendanceHandler,
    @inject(GetAttendanceByDateRangeHandler)
    private dateRangeHandler: GetAttendanceByDateRangeHandler,
    @inject(GetAttendanceSummaryHandler)
    private summaryHandler: GetAttendanceSummaryHandler,
    @inject(BulkUpsertAttendanceHandler)
    private bulkHandler: BulkUpsertAttendanceHandler
  ) {}

  async createAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { employeeId, date, checkInTime, checkOutTime, status, leaveType, remarks, createdBy } = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      const command = new CreateAttendanceCommand(
        employeeId,
        organizationId,
        new Date(date),
        checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime ? new Date(checkOutTime) : undefined,
        status,
        leaveType,
        remarks,
        createdBy || req.user?.userId
      );

      const result = await this.createHandler.execute(command);

      res.status(201).json(
        ResponseFormatter.success(result, "Attendance created successfully", 201)
      );
    } catch (error) {
      this.logger.error("Error creating attendance", error);
      this.handleError(error, res);
    }
  }

  async getAttendanceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      const result = await this.attendanceService.getAttendanceById(id, organizationId);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance retrieved successfully")
      );
    } catch (error) {
      this.logger.error("Error fetching attendance", error);
      this.handleError(error, res);
    }
  }

  async getAttendanceByEmployeeDate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { employeeId, date } = req.query;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      if (!employeeId || !date) {
        throw new AppError(
          "Employee ID and date are required",
          400
        );
      }

      const result = await this.attendanceService.getAttendanceByEmployeeDate(
        employeeId as string,
        organizationId,
        new Date(date as string)
      );

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance retrieved successfully")
      );
    } catch (error) {
      this.logger.error("Error fetching attendance", error);
      this.handleError(error, res);
    }
  }

  async updateAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { checkInTime, checkOutTime, status, leaveType, remarks, workHours, overtime } = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      const command = new UpdateAttendanceCommand(
        id,
        organizationId,
        checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime ? new Date(checkOutTime) : undefined,
        status,
        leaveType,
        remarks,
        workHours,
        overtime
      );

      const result = await this.updateHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance updated successfully")
      );
    } catch (error) {
      this.logger.error("Error updating attendance", error);
      this.handleError(error, res);
    }
  }

  async deleteAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      const command = new DeleteAttendanceCommand(id, organizationId);
      await this.deleteHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(null, "Attendance deleted successfully")
      );
    } catch (error) {
      this.logger.error("Error deleting attendance", error);
      this.handleError(error, res);
    }
  }

  async getAttendanceByDateRange(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      if (!startDate || !endDate) {
        throw new AppError(
          "Start date and end date are required",
          400
        );
      }

      const command = new GetAttendanceByDateRangeCommand(
        organizationId,
        new Date(startDate as string),
        new Date(endDate as string),
        employeeId as string
      );

      const result = await this.dateRangeHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance records retrieved successfully")
      );
    } catch (error) {
      this.logger.error("Error fetching attendance by date range", error);
      this.handleError(error, res);
    }
  }

  async getAttendanceSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      if (!employeeId || !startDate || !endDate) {
        throw new AppError(
          "Employee ID, start date, and end date are required",
          400
        );
      }

      const command = new GetAttendanceSummaryCommand(
        employeeId as string,
        organizationId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const result = await this.summaryHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance summary retrieved successfully")
      );
    } catch (error) {
      this.logger.error("Error fetching attendance summary", error);
      this.handleError(error, res);
    }
  }

  async bulkUpsertAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { attendances } = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      if (!attendances || !Array.isArray(attendances)) {
        throw new AppError(
          "Attendances must be an array",
          400
        );
      }

      const command = new BulkUpsertAttendanceCommand(attendances, organizationId);
      const result = await this.bulkHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance records upserted successfully")
      );
    } catch (error) {
      this.logger.error("Error bulk upserting attendance", error);
      this.handleError(error, res);
    }
  }

  async approveAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;
      const approvedBy = req.user?.userId;

      if (!organizationId || !approvedBy) {
        throw new AppError("Missing user context", 400);
      }

      const command = new ApproveAttendanceCommand(id, organizationId, approvedBy);
      const result = await this.approveHandler.execute(command);

      res.status(200).json(
        ResponseFormatter.success(result, "Attendance approved successfully")
      );
    } catch (error) {
      this.logger.error("Error approving attendance", error);
      this.handleError(error, res);
    }
  }

  async getPendingApprovals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new AppError("Organization ID missing", 400);
      }

      const result = await this.attendanceService.getPendingApprovals(
        organizationId,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 20
      );

      res.status(200).json(
        ResponseFormatter.success(result, "Pending approvals retrieved successfully")
      );
    } catch (error) {
      this.logger.error("Error fetching pending approvals", error);
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(
        ResponseFormatter.error(
          error.message,
          error.statusCode
        )
      );
    } else if (error.code === 3 || error.message?.includes('INVALID_ARGUMENT')) {
      res.status(400).json(
        ResponseFormatter.error(
          error.message || 'Invalid request',
          400
        )
      );
    } else if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
      res.status(404).json(
        ResponseFormatter.error(
          error.message || 'Employee not found',
          404
        )
      );
    } else {
      res.status(500).json(
        ResponseFormatter.error(
          error.message || 'Internal server error',
          500
        )
      );
    }
  }
}
