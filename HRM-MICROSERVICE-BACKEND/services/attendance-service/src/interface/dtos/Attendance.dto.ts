export class CreateAttendanceDto {
  employeeId!: string;
  organizationId!: string;
  date!: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status?: "present" | "absent" | "leave" | "half-day" | "late";
  leaveType?: "sick" | "casual" | "earned" | "unpaid" | "maternity" | "other";
  remarks?: string;
  createdBy?: string;
}

export class UpdateAttendanceDto {
  id!: string;
  organizationId!: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status?: "present" | "absent" | "leave" | "half-day" | "late";
  leaveType?: "sick" | "casual" | "earned" | "unpaid" | "maternity" | "other";
  remarks?: string;
  workHours?: number;
  overtime?: number;
}

export class AttendanceFilterDto {
  organizationId!: string;
  employeeId?: string;
  status?: string;
  isApproved?: boolean;
  startDate?: Date;
  endDate?: Date;
  page: number = 1;
  limit: number = 10;
}

export class AttendanceResponseDto {
  _id?: string;
  employeeId!: string;
  organizationId!: string;
  date!: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status!: "present" | "absent" | "leave" | "half-day" | "late";
  leaveType?: string;
  remarks?: string;
  isApproved!: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  workHours?: number;
  overtime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AttendanceSummaryDto {
  totalPresent!: number;
  totalAbsent!: number;
  totalLeave!: number;
  totalLate!: number;
  totalHalfDay!: number;
  workingHours!: number;
  overtimeHours!: number;
}

export class GetAttendanceByDateRangeDto {
  organizationId!: string;
  employeeId?: string;
  startDate!: Date;
  endDate!: Date;
  page?: number;
  limit?: number;
}

export class ApproveAttendanceDto {
  id!: string;
  organizationId!: string;
  approvedBy!: string;
}

export class BulkUpsertAttendanceDto {
  attendances!: CreateAttendanceDto[];
  organizationId!: string;
}
