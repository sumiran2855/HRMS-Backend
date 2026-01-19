import { injectable, inject } from "inversify";
import { IAttendanceRepository } from "../ports/AttendanceRepository.port";
import {
  IAttendance,
  IAttendanceInput,
  IAttendanceFilter,
  IAttendanceSummary,
} from "../../domain/entities/Attendance.entity";
import { Logger } from "../../shared/utils/logger.util";

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
    private attendanceRepository: IAttendanceRepository
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
        }
      );

      return await this.attendanceRepository.create(attendance);
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

  
  async updateAttendance(
    id: string,
    organizationId: string,
    updateData: Partial<IAttendanceInput>
  ): Promise<IAttendance> {
    try {
      this.logger.info(`Updating attendance ${id}`, { organizationId });

      const updated = await this.attendanceRepository.update(
        id,
        organizationId,
        updateData
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

      return await this.attendanceRepository.bulkUpsert(
        attendances,
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

  
  calculateWorkingHours(checkInTime: Date, checkOutTime: Date): number {
    const diff = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 100) / 100; // Round to 2 decimal places
  }

  
  determineAttendanceStatus(checkInTime?: Date): "present" | "late" | "absent" {
    if (!checkInTime) return "absent";

    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();


    if (hour > 9 || (hour === 9 && minute > 30)) {
      return "late";
    }

    return "present";
  }

  
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
