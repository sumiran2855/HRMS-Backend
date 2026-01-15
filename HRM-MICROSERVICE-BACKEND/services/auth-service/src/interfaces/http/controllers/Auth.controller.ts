import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { IAuthService } from "../../../application/services/auth.service";
import { LoginRequest, RegisterRequest } from "../../dtos/auth.dto";
import { ResponseFormatter } from "../../../shared/utils/response-formatter.util";
import { Logger } from "../../../shared/utils/logger.util";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../../../shared/constants/messages.constant";
import { AppError } from "../../../shared/utils/error-handler.util";

@injectable()
export class AuthController {
  private logger = new Logger("AuthController");

  constructor(@inject("AuthService") private authService: IAuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Register request:`, {
        email: req.body.email,
        username: req.body.username,
      });

      const { email, username, password, fullName, role } =
        req.body as RegisterRequest;

      const result = await this.authService.register(
        email,
        username,
        password,
        fullName,
        role
      );

      this.logger.info(`[${requestId}] User registered successfully: ${email}`);

      res
        .status(HTTP_STATUS.CREATED)
        .json(
          ResponseFormatter.success(
            result,
            SUCCESS_MESSAGES.REGISTER_SUCCESS,
            HTTP_STATUS.CREATED
          )
        );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Register error:`, error);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              error.message || ERROR_MESSAGES.INTERNAL_ERROR,
              HTTP_STATUS.BAD_REQUEST
            );

      throw appError;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Login request for:`, req.body.email);

      const { email, password } = req.body as LoginRequest;

      const result = await this.authService.login(email, password);

      this.logger.info(`[${requestId}] User logged in successfully: ${email}`);

      res
        .status(HTTP_STATUS.OK)
        .json(
          ResponseFormatter.success(
            result,
            SUCCESS_MESSAGES.LOGIN_SUCCESS,
            HTTP_STATUS.OK
          )
        );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Login error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INVALID_CREDENTIALS,
              HTTP_STATUS.UNAUTHORIZED
            );

      throw appError;
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new AppError("Token is required", HTTP_STATUS.BAD_REQUEST);
      }

      const payload = await this.authService.validateToken(token);

      this.logger.debug(`[${requestId}] Token validated successfully`);

      res
        .status(HTTP_STATUS.OK)
        .json(
          ResponseFormatter.success(
            { valid: true, payload },
            SUCCESS_MESSAGES.TOKEN_VALID,
            HTTP_STATUS.OK
          )
        );
    } catch (error: any) {
      this.logger.error(
        `[${requestId}] Token validation error:`,
        error.message
      );

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INVALID_TOKEN,
              HTTP_STATUS.UNAUTHORIZED
            );

      throw appError;
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError(
          ERROR_MESSAGES.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      this.logger.debug(`[${requestId}] Fetching user: ${userId}`);

      const user = await this.authService.getCurrentUser(userId);

      this.logger.info(`[${requestId}] User fetched successfully: ${userId}`);

      res
        .status(HTTP_STATUS.OK)
        .json(
          ResponseFormatter.success(
            user,
            SUCCESS_MESSAGES.USER_FETCHED,
            HTTP_STATUS.OK
          )
        );
    } catch (error: any) {
      this.logger.error(
        `[${requestId}] Get current user error:`,
        error.message
      );

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INTERNAL_ERROR,
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );

      throw appError;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError(
          ERROR_MESSAGES.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      this.logger.info(`[${requestId}] User logged out: ${userId}`);

      res
        .status(HTTP_STATUS.OK)
        .json(
          ResponseFormatter.success(
            { message: SUCCESS_MESSAGES.LOGOUT_SUCCESS },
            SUCCESS_MESSAGES.LOGOUT_SUCCESS,
            HTTP_STATUS.OK
          )
        );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Logout error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INTERNAL_ERROR,
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );

      throw appError;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError(
          "Refresh token is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      this.logger.debug(`[${requestId}] Refreshing token`);

      const result = await this.authService.refreshToken(refreshToken);

      this.logger.info(`[${requestId}] Token refreshed successfully`);

      res
        .status(HTTP_STATUS.OK)
        .json(
          ResponseFormatter.success(result, "Token refreshed", HTTP_STATUS.OK)
        );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Refresh token error:`, error.message);

      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INVALID_TOKEN,
              HTTP_STATUS.UNAUTHORIZED
            );

      throw appError;
    }
  }
}
