import { IAttendance, IAttendanceInput, IAttendanceFilter, IAttendanceSummary } from "../../domain/entities/Attendance.entity";

export interface IAttendanceRepository {
  create(attendance: IAttendanceInput): Promise<IAttendance>;
  findById(id: string, organizationId: string): Promise<IAttendance | null>;
  findByEmployeeAndDate(
    employeeId: string,
    organizationId: string,
    date: Date
  ): Promise<IAttendance | null>;
  update(
    id: string,
    organizationId: string,
    attendance: Partial<IAttendanceInput>
  ): Promise<IAttendance | null>;
  delete(id: string, organizationId: string): Promise<boolean>;
  findByFilters(filters: IAttendanceFilter): Promise<IAttendance[]>;
  findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<IAttendance[]>;
  getAttendanceSummary(
    employeeId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAttendanceSummary>;
  bulkUpsert(
    attendances: IAttendanceInput[],
    organizationId: string
  ): Promise<IAttendance[]>;
  approveAttendance(
    id: string,
    organizationId: string,
    approvedBy: string
  ): Promise<IAttendance | null>;
}
