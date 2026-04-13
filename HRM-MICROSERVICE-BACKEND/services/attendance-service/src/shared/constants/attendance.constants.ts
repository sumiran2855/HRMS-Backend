export const ATTENDANCE_CONSTANTS = {
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  STATUS: {
    PRESENT: "present",
    ABSENT: "absent",
    LEAVE: "leave",
    HALF_DAY: "half-day",
    LATE: "late",
  },

  LEAVE_TYPE: {
    SICK: "sick",
    CASUAL: "casual",
    EARNED: "earned",
    UNPAID: "unpaid",
    MATERNITY: "maternity",
    OTHER: "other",
  },

  ERROR_MESSAGES: {
    ATTENDANCE_NOT_FOUND: "Attendance record not found",
    DUPLICATE_ATTENDANCE: "Attendance already exists for this date",
    MISSING_ORG_ID: "Organization ID missing",
    MISSING_PARAMS: "Required parameters missing",
    INVALID_DATE_RANGE: "Start date must be before end date",
    EMPTY_ATTENDANCE_LIST: "Attendance records cannot be empty",
    MISSING_CONTEXT: "Missing user context",
    INVALID_FORMAT: "Invalid request format",
    CROSS_TENANT_ACCESS_DENIED: "Access denied: Tenant mismatch",
  },

  SUCCESS_MESSAGES: {
    ATTENDANCE_CREATED: "Attendance created successfully",
    ATTENDANCE_UPDATED: "Attendance updated successfully",
    ATTENDANCE_DELETED: "Attendance deleted successfully",
    ATTENDANCE_RETRIEVED: "Attendance retrieved successfully",
    ATTENDANCE_APPROVED: "Attendance approved successfully",
    RECORDS_RETRIEVED: "Attendance records retrieved successfully",
    SUMMARY_RETRIEVED: "Attendance summary retrieved successfully",
    RECORDS_UPSERTED: "Attendance records upserted successfully",
    PENDING_RETRIEVED: "Pending approvals retrieved successfully",
  },

  DEFAULTS: {
    WORK_HOURS: 8,
    OFFICE_START_TIME: 9,
    LATE_THRESHOLD_MINUTES: 30,
    PAGE: 1,
    LIMIT: 10,
    PAGE_LIMIT: 20,
  },

  QUERY: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
  },

  ERROR_CODES: {
    ATTENDANCE_NOT_FOUND: "ATTENDANCE_NOT_FOUND",
    DUPLICATE_ATTENDANCE: "DUPLICATE_ATTENDANCE",
    MISSING_ORG_ID: "MISSING_ORG_ID",
    MISSING_PARAMS: "MISSING_PARAMS",
    INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
    EMPTY_ATTENDANCE_LIST: "EMPTY_ATTENDANCE_LIST",
    MISSING_CONTEXT: "MISSING_CONTEXT",
    INVALID_FORMAT: "INVALID_FORMAT",
    CROSS_TENANT_ACCESS_DENIED: "CROSS_TENANT_ACCESS_DENIED",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  },
};
