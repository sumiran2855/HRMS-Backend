import { Schema, Document, model } from "mongoose";

export interface ILeaveType extends Document {
  name: string;
  maxDaysPerYear: number;
  carryForwardDays: number;
  requiresApproval: boolean;
  requiresAttachment: boolean;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"],
    },
    maxDaysPerYear: {
      type: Number,
      required: true,
      min: 0,
    },
    carryForwardDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    requiresAttachment: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

leaveTypeSchema.index({ name: 1 });

export const LeaveType = model<ILeaveType>("LeaveType", leaveTypeSchema);
