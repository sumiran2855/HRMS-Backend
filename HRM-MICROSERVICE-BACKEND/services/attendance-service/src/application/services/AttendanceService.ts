import { injectable, inject } from "inversify";
import { IAttendanceRepository } from "../ports/AttendanceRepository.port";
import {
  IAttendance,
  IAttendanceInput,
  IAttendanceFilter,
  IAttendanceSummary,
} from "../../domain/entities/Attendance.entity";
import { Logger } from "../../shared/utils/logger.util";
import { EmployeeGrpcClient } from "../../infrastructure/grpc/employee.grpc.client";

class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

@injectable()
export class AttendanceService {
  private logger = new Logger("AttendanceService");

  constructor(
    @inject("AttendanceRepository")
    private attendanceRepository: IAttendanceRepository,
    @inject(EmployeeGrpcClient)
    private employeeGrpcClient: EmployeeGrpcClient
  ) {}

  
  async createAttendance(
    attendance: IAttendanceInput
  ): Promise<IAttendance> {
    try {
      this.logger.info(
        `Creating attendance for employee ${attendance.employeeId}`,
        {
          organizationId: attendance.organizationId,
          date: attendance.date,
          status: attendance.status,
        }
      );

      await this.validateEmployeeExists(attendance.employeeId);

      const processedAttendance = this.processAttendanceData(attendance);

      return await this.attendanceRepository.create(processedAttendance);
    } catch (error) {
      this.logger.error("Error creating attendance", error);
      throw error;
    }
  }

  
  async getAttendanceById(
    id: string,
    organizationId: string
  ): Promise<IAttendance> {
    try {
      const attendance = await this.attendanceRepository.findById(
        id,
        organizationId
      );

      if (!attendance) {
        throw new ApplicationError(
          "Attendance record not found",
          404,
          "ATTENDANCE_NOT_FOUND"
        );
      }

      return attendance;
    } catch (error) {
      this.logger.error("Error fetching attendance", error);
      throw error;
    }
  }

  
  async getAttendanceByEmployeeDate(
    employeeId: string,
    organizationId: string,
    date: Date
  ): Promise<IAttendance | null> {
    try {
      return await this.attendanceRepository.findByEmployeeAndDate(
        employeeId,
        organizationId,
        date
      );
    } catch (error) {
      this.logger.error("Error fetching attendance by employee and date", error);
      throw error;
    }
  }

  private async validateEmployeeExists(employeeId: string): Promise<void> {
    try {
      await this.employeeGrpcClient.initialize();

      const employee = await this.employeeGrpcClient.getEmployeeById(employeeId);

      if (!employee) {
        throw new ApplicationError(
          `Employee with ID ${employeeId} does not exist`,
          404,
          "EMPLOYEE_NOT_FOUND"
        );
      }

      this.logger.info(`✓ Employee ${employeeId} validated successfully`);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      if (error.code === 5 || error.message?.includes("not found") || error.message?.includes("does not exist")) {
        throw new ApplicationError(
          `Employee with ID ${employeeId} does not exist`,
          404,
          "EMPLOYEE_NOT_FOUND"
        );
      }

      this.logger.error(
        `Error validating employee ${employeeId}:`,
        error.message || error
      );
      throw error;
    }
  }

  async updateAttendance(
    id: string,
    organizationId: string,
    updateData: Partial<IAttendanceInput>
  ): Promise<IAttendance> {
    try {
      this.logger.info(`Updating attendance ${id}`, {
        organizationId,
        status: updateData.status,
      });

      if (updateData.employeeId) {
        await this.validateEmployeeExists(updateData.employeeId);
      }

      const processedData = this.processAttendanceUpdate(updateData);

      const updated = await this.attendanceRepository.update(
        id,
        organizationId,
        processedData
      );

      if (!updated) {
        throw new ApplicationError(
          "Attendance record not found",
          404,
          "ATTENDANCE_NOT_FOUND"
        );
      }

      return updated;
    } catch (error) {
      this.logger.error("Error updating attendance", error);
      throw error;
    }
  }

  
  async deleteAttendance(
    id: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      this.logger.info(`Deleting attendance ${id}`, { organizationId });

      const deleted = await this.attendanceRepository.delete(
        id,
        organizationId
      );

      if (!deleted) {
        throw new ApplicationError(
          "Attendance record not found",
          404,
          "ATTENDANCE_NOT_FOUND"
        );
      }

      return true;
    } catch (error) {
      this.logger.error("Error deleting attendance", error);
      throw error;
    }
  }

  
  async getAttendanceByFilters(
    filters: IAttendanceFilter
  ): Promise<IAttendance[]> {
    try {
      this.logger.info("Fetching attendance with filters", filters);
      return await this.attendanceRepository.findByFilters(filters);
    } catch (error) {
      this.logger.error("Error fetching attendance by filters", error);
      throw error;
    }
  }

  
  async getAttendanceByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<IAttendance[]> {
    try {
      if (startDate > endDate) {
        throw new ApplicationError(
          "Start date must be before end date",
          400,
          "INVALID_DATE_RANGE"
        );
      }

      this.logger.info("Fetching attendance by date range", {
        organizationId,
        startDate,
        endDate,
        employeeId,
      });

      return await this.attendanceRepository.findByDateRange(
        organizationId,
        startDate,
        endDate,
        employeeId
      );
    } catch (error) {
      this.logger.error("Error fetching attendance by date range", error);
      throw error;
    }
  }

  
  async getAttendanceSummary(
    employeeId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAttendanceSummary> {
    try {
      this.logger.info("Generating attendance summary", {
        employeeId,
        organizationId,
        startDate,
        endDate,
      });

      return await this.attendanceRepository.getAttendanceSummary(
        employeeId,
        organizationId,
        startDate,
        endDate
      );
    } catch (error) {
      this.logger.error("Error generating attendance summary", error);
      throw error;
    }
  }

  
  async bulkUpsertAttendance(
    attendances: IAttendanceInput[],
    organizationId: string
  ): Promise<IAttendance[]> {
    try {
      if (!attendances || attendances.length === 0) {
        throw new ApplicationError(
          "Attendance records cannot be empty",
          400,
          "EMPTY_ATTENDANCE_LIST"
        );
      }

      this.logger.info(
        `Bulk upserting ${attendances.length} attendance records`,
        { organizationId }
      );

      // Validate all employees exist before processing
      const employeeIds = [...new Set(attendances.map(a => a.employeeId))];
      for (const employeeId of employeeIds) {
        await this.validateEmployeeExists(employeeId);
      }

      // Process each attendance record based on its status
      const processedAttendances = attendances.map((attendance) =>
        this.processAttendanceData(attendance)
      );

      return await this.attendanceRepository.bulkUpsert(
        processedAttendances,
        organizationId
      );
    } catch (error) {
      this.logger.error("Error in bulk upsert attendance", error);
      throw error;
    }
  }

  
  async approveAttendance(
    id: string,
    organizationId: string,
    approvedBy: string
  ): Promise<IAttendance> {
    try {
      this.logger.info(`Approving attendance ${id}`, {
        organizationId,
        approvedBy,
      });

      const approved = await this.attendanceRepository.approveAttendance(
        id,
        organizationId,
        approvedBy
      );

      if (!approved) {
        throw new ApplicationError(
          "Attendance record not found",
          404,
          "ATTENDANCE_NOT_FOUND"
        );
      }

      return approved;
    } catch (error) {
      this.logger.error("Error approving attendance", error);
      throw error;
    }
  }

  
  /**
   * Process attendance update data based on status
   * Ensures consistency when updating attendance records
   */
  private processAttendanceUpdate(
    updateData: Partial<IAttendanceInput>
  ): Partial<IAttendanceInput> {
    // If status is not being updated, return as-is
    if (!updateData.status) {
      return updateData;
    }

    const processed = { ...updateData };

    switch (updateData.status) {
      case "leave":
        // For leave: clear check-in/out times and working hours
        processed.checkInTime = undefined;
        processed.checkOutTime = undefined;
        processed.workHours = 0;
        processed.overtime = 0;
        break;

      case "absent":
        // For absent: clear check-in/out times
        processed.checkInTime = undefined;
        processed.checkOutTime = undefined;
        processed.workHours = 0;
        processed.overtime = 0;
        break;

      case "half-day":
        // For half-day: recalculate if times are provided
        if (processed.checkInTime && processed.checkOutTime) {
          const workHours = this.calculateWorkingHours(
            processed.checkInTime,
            processed.checkOutTime
          );
          processed.workHours = Math.min(workHours, 4);
          processed.overtime = 0;
        } else {
          processed.workHours = 0;
          processed.overtime = 0;
        }
        break;

      case "present":
      case "late":
        // For present/late: recalculate if times are provided
        if (processed.checkInTime && processed.checkOutTime) {
          const workHours = this.calculateWorkingHours(
            processed.checkInTime,
            processed.checkOutTime
          );
          processed.workHours = workHours;
          processed.overtime =
            workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0;
        }
        break;
    }

    return processed;
  }

  /**
   * Process attendance data based on status
   * Handles special cases like leave, half-day, and absent
   */
  private processAttendanceData(
    attendance: IAttendanceInput
  ): IAttendanceInput {
    const processed = { ...attendance };

    switch (attendance.status) {
      case "leave":
        // For leave: clear check-in/out times and working hours
        processed.checkInTime = undefined;
        processed.checkOutTime = undefined;
        processed.workHours = 0;
        processed.overtime = 0;
        this.logger.info(
          `Leave record processed for employee ${attendance.employeeId}, type: ${attendance.leaveType}`
        );
        break;

      case "absent":
        // For absent: clear check-in/out times
        processed.checkInTime = undefined;
        processed.checkOutTime = undefined;
        processed.workHours = 0;
        processed.overtime = 0;
        this.logger.info(
          `Absent record processed for employee ${attendance.employeeId}`
        );
        break;

      case "half-day":
        // For half-day: calculate working hours if both times provided, max 4 hours
        if (processed.checkInTime && processed.checkOutTime) {
          const workHours = this.calculateWorkingHours(
            processed.checkInTime,
            processed.checkOutTime
          );
          // Half-day should typically be around 4 hours
          processed.workHours = Math.min(workHours, 4);
          processed.overtime = 0;
          this.logger.info(
            `Half-day record processed for employee ${attendance.employeeId}, work hours: ${processed.workHours}`
          );
        } else {
          // If times not provided, default to 0
          processed.workHours = 0;
          processed.overtime = 0;
        }
        break;

      case "present":
      case "late":
        // For present/late: calculate working hours and overtime if both times provided
        if (processed.checkInTime && processed.checkOutTime) {
          const workHours = this.calculateWorkingHours(
            processed.checkInTime,
            processed.checkOutTime
          );
          processed.workHours = workHours;

          // Calculate overtime (anything over 8 hours)
          const standardWorkHours = 8;
          processed.overtime =
            workHours > standardWorkHours
              ? Math.round((workHours - standardWorkHours) * 100) / 100
              : 0;

          this.logger.info(
            `Work record processed for employee ${attendance.employeeId}, work hours: ${processed.workHours}, overtime: ${processed.overtime}`
          );
        } else {
          // If times not provided, default to 0
          processed.workHours = processed.workHours || 0;
          processed.overtime = 0;
        }
        break;

      default:
        // Default: keep as is but ensure no overflow
        if (processed.checkInTime && processed.checkOutTime) {
          const workHours = this.calculateWorkingHours(
            processed.checkInTime,
            processed.checkOutTime
          );
          processed.workHours = workHours;
          processed.overtime =
            workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0;
        }
    }
    return processed;
  }

  /**
   * Calculate working hours between check-in and check-out time
   */
  calculateWorkingHours(checkInTime: Date, checkOutTime: Date): number {
    const diff = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Determine attendance status based on check-in time
   */
  determineAttendanceStatus(checkInTime?: Date): "present" | "late" | "absent" {
    if (!checkInTime) return "absent";

    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();

    // If check-in is after 9:30 AM, mark as late
    if (hour > 9 || (hour === 9 && minute > 30)) {
      return "late";
    }

    return "present";
  }

  /**
   * Get pending approvals for attendance
   */
  async getPendingApprovals(
    organizationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IAttendance[]> {
    try {
      return await this.attendanceRepository.findByFilters({
        organizationId,
        isApproved: false,
        page,
        limit,
      });
    } catch (error) {
      this.logger.error("Error fetching pending approvals", error);
      throw error;
    }
  }
}
