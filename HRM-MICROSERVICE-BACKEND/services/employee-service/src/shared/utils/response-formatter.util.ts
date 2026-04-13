export class ResponseFormatter {
  static success(data: any, message: string = 'Success', statusCode: number = 200) {
    return {
      success: true,
      message,
      statusCode,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, statusCode: number = 500) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(data: any[], message: string, statusCode: number, pagination: any) {
    return {
      success: true,
      message,
      statusCode,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };
  }
}
