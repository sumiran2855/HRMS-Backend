export interface AuthenticatedRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
  id?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponseType<T = any> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: string;
  timestamp?: string;
  requestId?: string;
}
