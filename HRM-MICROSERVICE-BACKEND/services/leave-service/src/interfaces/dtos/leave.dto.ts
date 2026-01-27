export class CreateLeaveRequest {
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  attachmentUrl?: string;
}

export class UpdateLeaveRequest {
  reason?: string;
  attachmentUrl?: string;
  status?: string;
}

export class ApproveLeaveRequest {
  approvedBy: string;
}

export class RejectLeaveRequest {
  rejectionReason: string;
}

export class LeaveResponse {
  _id: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  attachmentUrl?: string;
  status: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LeaveBalanceResponse {
  employeeId: string;
  year: number;
  casual: number;
  casualUsed: number;
  casualRemaining: number;
  sick: number;
  sickUsed: number;
  sickRemaining: number;
  earned: number;
  earnedUsed: number;
  earnedRemaining: number;
  maternity: number;
  maternityUsed: number;
  maternityRemaining: number;
  paternity: number;
  paternityUsed: number;
  paternityRemaining: number;
  unpaid: number;
  unpaidUsed: number;
  other: number;
  otherUsed: number;
  otherRemaining: number;
}

export class CreateLeaveTypeRequest {
  name: string;
  maxDaysPerYear: number;
  carryForwardDays?: number;
  requiresApproval?: boolean;
  requiresAttachment?: boolean;
  description?: string;
}

export class InitializeLeaveBalanceRequest {
  employeeId: string;
  year: number;
}

export class LeaveTypeResponse {
  _id: string;
  name: string;
  maxDaysPerYear: number;
  carryForwardDays: number;
  requiresApproval: boolean;
  requiresAttachment: boolean;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
