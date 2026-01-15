import { injectable, inject } from "inversify";
import { AttendanceService } from "../services/AttendanceService";
import {
  CreateAttendanceCommand,
  UpdateAttendanceCommand,
  DeleteAttendanceCommand,
  ApproveAttendanceCommand,
  GetAttendanceByDateRangeCommand,
  GetAttendanceSummaryCommand,
  BulkUpsertAttendanceCommand,
} from "../commands/Attendance.command";
import { IAttendance, IAttendanceSummary } from "../../domain/entities/Attendance.entity";
import { Logger } from "../../shared/utils/logger.util";

@injectable()
export class CreateAttendanceHandler {
  private logger = new Logger("CreateAttendanceHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: CreateAttendanceCommand): Promise<IAttendance> {
    this.logger.info("Executing CreateAttendanceCommand", {
      employeeId: command.employeeId,
      date: command.date,
    });

    const workHours = command.checkInTime && command.checkOutTime
      ? this.service.calculateWorkingHours(command.checkInTime, command.checkOutTime)
      : 8;

    const status = command.status || this.service.determineAttendanceStatus(command.checkInTime);

    return this.service.createAttendance({
      employeeId: command.employeeId,
      organizationId: command.organizationId,
      date: command.date,
      checkInTime: command.checkInTime,
      checkOutTime: command.checkOutTime,
      status,
      leaveType: command.leaveType,
      remarks: command.remarks,
      workHours,
      createdBy: command.createdBy,
    });
  }
}

@injectable()
export class UpdateAttendanceHandler {
  private logger = new Logger("UpdateAttendanceHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: UpdateAttendanceCommand): Promise<IAttendance> {
    this.logger.info("Executing UpdateAttendanceCommand", {
      id: command.id,
      organizationId: command.organizationId,
    });

    const workHours = command.checkInTime && command.checkOutTime
      ? this.service.calculateWorkingHours(command.checkInTime, command.checkOutTime)
      : command.workHours;

    return this.service.updateAttendance(command.id, command.organizationId, {
      checkInTime: command.checkInTime,
      checkOutTime: command.checkOutTime,
      status: command.status,
      leaveType: command.leaveType,
      remarks: command.remarks,
      workHours,
      overtime: command.overtime,
    });
  }
}

@injectable()
export class DeleteAttendanceHandler {
  private logger = new Logger("DeleteAttendanceHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: DeleteAttendanceCommand): Promise<boolean> {
    this.logger.info("Executing DeleteAttendanceCommand", {
      id: command.id,
      organizationId: command.organizationId,
    });

    return this.service.deleteAttendance(command.id, command.organizationId);
  }
}

@injectable()
export class ApproveAttendanceHandler {
  private logger = new Logger("ApproveAttendanceHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: ApproveAttendanceCommand): Promise<IAttendance> {
    this.logger.info("Executing ApproveAttendanceCommand", {
      id: command.id,
      approvedBy: command.approvedBy,
    });

    return this.service.approveAttendance(
      command.id,
      command.organizationId,
      command.approvedBy
    );
  }
}

@injectable()
export class GetAttendanceByDateRangeHandler {
  private logger = new Logger("GetAttendanceByDateRangeHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: GetAttendanceByDateRangeCommand): Promise<IAttendance[]> {
    this.logger.info("Executing GetAttendanceByDateRangeCommand", {
      organizationId: command.organizationId,
      employeeId: command.employeeId,
    });

    return this.service.getAttendanceByDateRange(
      command.organizationId,
      command.startDate,
      command.endDate,
      command.employeeId
    );
  }
}

@injectable()
export class GetAttendanceSummaryHandler {
  private logger = new Logger("GetAttendanceSummaryHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: GetAttendanceSummaryCommand): Promise<IAttendanceSummary> {
    this.logger.info("Executing GetAttendanceSummaryCommand", {
      employeeId: command.employeeId,
      organizationId: command.organizationId,
    });

    return this.service.getAttendanceSummary(
      command.employeeId,
      command.organizationId,
      command.startDate,
      command.endDate
    );
  }
}

@injectable()
export class BulkUpsertAttendanceHandler {
  private logger = new Logger("BulkUpsertAttendanceHandler");

  constructor(@inject("AttendanceService") private service: AttendanceService) {}

  async execute(command: BulkUpsertAttendanceCommand): Promise<IAttendance[]> {
    this.logger.info("Executing BulkUpsertAttendanceCommand", {
      count: command.attendances.length,
      organizationId: command.organizationId,
    });

    return this.service.bulkUpsertAttendance(
      command.attendances,
      command.organizationId
    );
  }
}
