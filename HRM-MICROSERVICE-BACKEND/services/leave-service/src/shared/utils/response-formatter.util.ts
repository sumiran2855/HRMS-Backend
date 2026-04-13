export class ResponseFormatter {
  static success(data: any, message: string, statusCode: number = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, statusCode: number = 500, details?: any) {
    return {
      success: false,
      statusCode,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(
    data: any[],
    message: string,
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
