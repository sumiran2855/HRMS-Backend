import { Container } from "inversify";
import express, { Router, Request, Response, NextFunction } from "express";
import { LeaveController } from "../controllers/Leave.controller";
import { authMiddleware, requirePermission, AuthRequest } from "../../../shared/middleware/auth.middleware";
import { PermissionEnum } from "../../../domain/entities/Role.entity";

export function registerLeaveRoutes(
  app: express.Application,
  container: Container
): void {
  const router = Router();

  // Leave Request Routes
  router.post(
    "/request",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.CREATE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.requestLeave(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/employee/:employeeId",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.getLeavesByEmployeeId(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:leaveId",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.getLeaveById(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.getAllLeaves(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/:leaveId/approve",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.APPROVE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.approveLeave(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/:leaveId/reject",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.APPROVE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.rejectLeave(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/:leaveId/cancel",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.UPDATE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.cancelLeave(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Balance Routes
  router.get(
    "/balance/:employeeId",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.getLeaveBalance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/balance/initialize",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.APPROVE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.initializeLeaveBalance(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Leave Type Routes
  router.get(
    "/types",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.READ_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.getAllLeaveTypes(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/types",
    (req: AuthRequest, res: Response, next: NextFunction) => authMiddleware(req, res, next),
    requirePermission(PermissionEnum.APPROVE_LEAVE),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const leaveController = container.get<LeaveController>(LeaveController);
        await leaveController.createLeaveType(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use("/api/leaves", router);
}
