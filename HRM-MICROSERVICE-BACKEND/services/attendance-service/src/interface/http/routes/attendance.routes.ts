import { Router, NextFunction, Response, RequestHandler } from "express";

import { container } from "../../../bootstrap/container.bootstrap";
import { AttendanceController } from "../AttendanceController";
import { authMiddleware, requirePermission, AuthRequest } from "../../../shared/middleware/auth.middleware";
import { PermissionEnum } from "../../../domain/entities/Role.entity";

const router = Router();
const attendanceController = container.get<AttendanceController>(AttendanceController);

const ensureTenantContext: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  if (!req.user?.organizationId) {
    return res.status(400).json({
      success: false,
      message: "Organization context missing",
      statusCode: 400,
    });
  }
  next();
};


router.use(authMiddleware as RequestHandler);
router.use(ensureTenantContext);


// router.post(
//   "/",
//   requirePermission(PermissionEnum.CREATE_ATTENDANCE) as RequestHandler,
//   (req: any, res: Response) => attendanceController.createAttendance(req, res)
// );

router.post(
    "/",
    requirePermission(PermissionEnum.CREATE_ATTENDANCE) as RequestHandler,
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const controller = container.get<AttendanceController>(AttendanceController);
        await controller.createAttendance(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

router.get(
  "/:id",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceById(req, res)
);


router.get(
  "/employee/date",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceByEmployeeDate(req, res)
);


router.put(
  "/:id",
  requirePermission(PermissionEnum.UPDATE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.updateAttendance(req, res)
);


router.delete(
  "/:id",
  requirePermission(PermissionEnum.DELETE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.deleteAttendance(req, res)
);


router.post(
  "/:id/approve",
  requirePermission(PermissionEnum.APPROVE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.approveAttendance(req, res)
);


router.get(
  "/range/query",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceByDateRange(req, res)
);


router.get(
  "/summary/stats",
  requirePermission(PermissionEnum.VIEW_REPORTS) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceSummary(req, res)
);


router.get(
  "/pending/approvals",
  requirePermission(PermissionEnum.APPROVE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getPendingApprovals(req, res)
);


router.post(
  "/bulk/upsert",
  requirePermission(PermissionEnum.CREATE_ATTENDANCE, PermissionEnum.UPDATE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.bulkUpsertAttendance(req, res)
);

export { router as attendanceRoutes };
