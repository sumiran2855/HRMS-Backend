import { IAttendanceInput } from "../../domain/entities/Attendance.entity";

export class CreateAttendanceCommand {
  constructor(
    public readonly employeeId: string,
    public readonly organizationId: string,
    public readonly date: Date,
    public readonly checkInTime?: Date,
    public readonly checkOutTime?: Date,
    public readonly status?: "present" | "absent" | "leave" | "half-day" | "late",
    public readonly leaveType?: string,
    public readonly remarks?: string,
    public readonly createdBy?: string
  ) {}
}

export class UpdateAttendanceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly checkInTime?: Date,
    public readonly checkOutTime?: Date,
    public readonly status?: "present" | "absent" | "leave" | "half-day" | "late",
    public readonly leaveType?: string,
    public readonly remarks?: string,
    public readonly workHours?: number,
    public readonly overtime?: number
  ) {}
}

export class DeleteAttendanceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string
  ) {}
}

export class ApproveAttendanceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly approvedBy: string
  ) {}
}

export class GetAttendanceByDateRangeCommand {
  constructor(
    public readonly organizationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly employeeId?: string
  ) {}
}

export class GetAttendanceSummaryCommand {
  constructor(
    public readonly employeeId: string,
    public readonly organizationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

export class BulkUpsertAttendanceCommand {
  constructor(
    public readonly attendances: IAttendanceInput[],
    public readonly organizationId: string
  ) {}
}
