import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    email?: string;
    role?: string;
    permissions?: string[];
  };
  id?: string;
  tenantId?: string;
}

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: string;
  errors?: any;
  requestId?: string;
  timestamp?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface DatabaseError extends Error {
  code?: string;
  statusCode?: number;
}

export interface GrpcError extends Error {
  code: string;
  details: string;
  metadata?: any;
}

export interface AttendanceReport {
  employeeId: string;
  organizationId: string;
  startDate: Date;
  endDate: Date;
  totalRecords: number;
  summary: {
    present: number;
    absent: number;
    leave: number;
    late: number;
    halfDay: number;
    workingHours: number;
    overtimeHours: number;
  };
  records: any[];
}
