import { Schema, Document, model } from "mongoose";

export interface ILeave extends Document {
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  attachmentUrl?: string;
  status: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ createdAt: -1 });

export const Leave = model<ILeave>("Leave", leaveSchema);
