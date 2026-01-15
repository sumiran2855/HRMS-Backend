import { Router, Request, Response, NextFunction } from "express";
import { Container } from "inversify";
import { authMiddleware, requirePermission } from "../../../shared/middleware/auth.middleware";
import { PermissionEnum } from "../../../domain/entities/Role.entity";
import { AttendanceController } from "../AttendanceController";

export function registerSecureAttendanceRoutes(
  app: any,
  container: Container
): void {
  const router = Router();

  router.post(
    "/",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.CREATE_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.createAttendance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.READ_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.getAttendanceByDateRange(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:id",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.READ_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.getAttendanceById(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.UPDATE_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.updateAttendance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:id",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.DELETE_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.deleteAttendance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.patch(
    "/:id/approve",
    (req: Request, res: Response, next: NextFunction) => authMiddleware(req as any, res, next),
    (req: Request, res: Response, next: NextFunction) => requirePermission(PermissionEnum.APPROVE_ATTENDANCE)(req as any, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.approveAttendance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use("/api/attendance", router);
}
