export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: string;
  errors?: any;
  requestId?: string;
  timestamp?: string;
}

export class ResponseFormatter {
  static success<T>(
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): ApiResponse<T> {
    return {
      success: true,
      message,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
    };
  }
static error(
    message: string = "Error",
    statusCode: number = 500,
    error?: any
  ): ApiResponse {
    return {
      success: false,
      message,
      statusCode,
      ...(error && { error }),
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Success"
  ): ApiResponse<T[]> & { pagination: any } {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message,
      statusCode: 200,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
