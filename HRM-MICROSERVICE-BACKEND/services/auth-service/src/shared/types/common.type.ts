/**
 * Request context type
 * Extended Express Request with additional properties
 */
export interface AuthenticatedRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
  id?: string;
}

/**
 * Token Payload type
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * API Response type
 */
export interface ApiResponseType<T = any> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: string;
  timestamp?: string;
  requestId?: string;
}
