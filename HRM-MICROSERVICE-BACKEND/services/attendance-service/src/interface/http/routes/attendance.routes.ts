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

// Apply auth middleware globally to all routes
router.use(authMiddleware as RequestHandler);
router.use(ensureTenantContext);

// Create Attendance - Requires create:attendance permission
router.post(
  "/",
  requirePermission(PermissionEnum.CREATE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.createAttendance(req, res)
);

// Get Attendance by ID - Requires read:attendance permission
router.get(
  "/:id",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceById(req, res)
);

// Get Attendance by Employee Date - Requires read:attendance permission
router.get(
  "/employee/date",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceByEmployeeDate(req, res)
);

// Update Attendance - Requires update:attendance permission
router.put(
  "/:id",
  requirePermission(PermissionEnum.UPDATE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.updateAttendance(req, res)
);

// Delete Attendance - Requires delete:attendance permission
router.delete(
  "/:id",
  requirePermission(PermissionEnum.DELETE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.deleteAttendance(req, res)
);

// Approve Attendance - Requires approve:attendance permission
router.post(
  "/:id/approve",
  requirePermission(PermissionEnum.APPROVE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.approveAttendance(req, res)
);

// Get Attendance by Date Range - Requires read:attendance permission
router.get(
  "/range/query",
  requirePermission(PermissionEnum.READ_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceByDateRange(req, res)
);

// Get Attendance Summary - Requires view:reports permission
router.get(
  "/summary/stats",
  requirePermission(PermissionEnum.VIEW_REPORTS) as RequestHandler,
  (req: any, res: Response) => attendanceController.getAttendanceSummary(req, res)
);

// Get Pending Approvals - Requires approve:attendance permission
router.get(
  "/pending/approvals",
  requirePermission(PermissionEnum.APPROVE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.getPendingApprovals(req, res)
);

// Bulk Upsert Attendance - Requires create:attendance and update:attendance permissions
router.post(
  "/bulk/upsert",
  requirePermission(PermissionEnum.CREATE_ATTENDANCE, PermissionEnum.UPDATE_ATTENDANCE) as RequestHandler,
  (req: any, res: Response) => attendanceController.bulkUpsertAttendance(req, res)
);

export { router as attendanceRoutes };
