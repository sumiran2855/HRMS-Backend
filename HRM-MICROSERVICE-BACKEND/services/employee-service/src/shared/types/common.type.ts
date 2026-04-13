export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    userId: string;
    email: string;
    username?: string;
  };
  id?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  username?: string;
}
