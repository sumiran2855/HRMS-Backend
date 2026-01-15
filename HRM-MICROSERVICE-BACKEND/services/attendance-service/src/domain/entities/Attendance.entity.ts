import { Document, ObjectId } from "mongoose";

export interface IAttendance extends Document {
  employeeId: string;
  organizationId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "present" | "absent" | "leave" | "half-day" | "late";
  leaveType?: "sick" | "casual" | "earned" | "unpaid" | "maternity" | "other";
  remarks?: string;
  approvedBy?: string;
  approvedAt?: Date;
  isApproved: boolean;
  workHours?: number;
  overtime?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface IAttendanceInput {
  employeeId: string;
  organizationId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "present" | "absent" | "leave" | "half-day" | "late";
  leaveType?: string;
  remarks?: string;
  workHours?: number;
  overtime?: number;
  createdBy?: string;
}

export interface IAttendanceFilter {
  employeeId?: string;
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  isApproved?: boolean;
  page?: number;
  limit?: number;
}

export interface IAttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  totalLate: number;
  totalHalfDay: number;
  workingHours: number;
  overtimeHours: number;
}
