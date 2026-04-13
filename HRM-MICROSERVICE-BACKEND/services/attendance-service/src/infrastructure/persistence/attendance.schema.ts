import mongoose, { Schema } from "mongoose";
import { IAttendance } from "../../domain/entities/Attendance.entity";

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      index: true,
    },
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "half-day", "late"],
      required: [true, "Status is required"],
      default: "present",
    },
    leaveType: {
      type: String,
      enum: [
        "sick",
        "casual",
        "earned",
        "unpaid",
        "maternity",
        "other",
        null,
      ],
    },
    remarks: {
      type: String,
      maxlength: 500,
    },
    approvedBy: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    workHours: {
      type: Number,
      default: 8,
      min: 0,
      max: 24,
    },
    overtime: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


AttendanceSchema.index({ organizationId: 1, employeeId: 1, date: 1 });


AttendanceSchema.index({ organizationId: 1, date: -1 });


AttendanceSchema.index({ organizationId: 1, isApproved: 1 });

export const AttendanceModel = mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema,
  "attendances"
);
