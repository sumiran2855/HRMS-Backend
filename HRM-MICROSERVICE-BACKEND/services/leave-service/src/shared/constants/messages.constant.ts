export const SUCCESS_MESSAGES = {
  LEAVE_REQUESTED: "Leave request created successfully",
  LEAVE_APPROVED: "Leave request approved successfully",
  LEAVE_REJECTED: "Leave request rejected successfully",
  LEAVE_CANCELLED: "Leave request cancelled successfully",
  LEAVE_RETRIEVED: "Leave request retrieved successfully",
  LEAVES_RETRIEVED: "Leave requests retrieved successfully",
  BALANCE_RETRIEVED: "Leave balance retrieved successfully",
  BALANCE_INITIALIZED: "Leave balance initialized successfully",
  LEAVE_TYPES_RETRIEVED: "Leave types retrieved successfully",
  LEAVE_TYPE_CREATED: "Leave type created successfully",
};

export const ERROR_MESSAGES = {
  EMPLOYEE_NOT_FOUND: "Employee not found",
  LEAVE_NOT_FOUND: "Leave request not found",
  INSUFFICIENT_BALANCE: "Insufficient leave balance",
  INVALID_DATE_RANGE: "Invalid date range",
  LEAVE_CONFLICT: "Leave conflict detected",
  INVALID_STATUS: "Invalid leave status",
  INVALID_TYPE: "Invalid leave type",
  DUPLICATE_LEAVE_TYPE: "Leave type already exists",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden access",
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation failed",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const LEAVE_TYPES = {
  CASUAL: "CASUAL",
  SICK: "SICK",
  EARNED: "EARNED",
  MATERNITY: "MATERNITY",
  PATERNITY: "PATERNITY",
  UNPAID: "UNPAID",
  OTHER: "OTHER",
};

export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

export const DEFAULT_LEAVE_ALLOCATION = {
  CASUAL: 12,
  SICK: 7,
  EARNED: 10,
  MATERNITY: 180,
  PATERNITY: 15,
  UNPAID: -1,
  OTHER: 0,
};
