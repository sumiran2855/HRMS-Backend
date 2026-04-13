export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid or expired token",
  INTERNAL_ERROR: "Internal server error",
  BAD_REQUEST: "Bad request",
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "Registration successful",
  TOKEN_VALID: "Token is valid",
  USER_FETCHED: "User fetched successfully",
  LOGOUT_SUCCESS: "Logout successful",
} as const;
