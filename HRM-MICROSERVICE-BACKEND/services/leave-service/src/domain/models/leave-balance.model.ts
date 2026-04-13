import { Schema, Document, model } from "mongoose";

export interface ILeaveBalance extends Document {
  employeeId: string;
  year: number;
  casual: number;
  casualUsed: number;
  sick: number;
  sickUsed: number;
  earned: number;
  earnedUsed: number;
  maternity: number;
  maternityUsed: number;
  paternity: number;
  paternityUsed: number;
  unpaid: number;
  unpaidUsed: number;
  other: number;
  otherUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    casual: {
      type: Number,
      default: 12,
    },
    casualUsed: {
      type: Number,
      default: 0,
    },
    sick: {
      type: Number,
      default: 7,
    },
    sickUsed: {
      type: Number,
      default: 0,
    },
    earned: {
      type: Number,
      default: 10,
    },
    earnedUsed: {
      type: Number,
      default: 0,
    },
    maternity: {
      type: Number,
      default: 180,
    },
    maternityUsed: {
      type: Number,
      default: 0,
    },
    paternity: {
      type: Number,
      default: 15,
    },
    paternityUsed: {
      type: Number,
      default: 0,
    },
    unpaid: {
      type: Number,
      default: -1,
    },
    unpaidUsed: {
      type: Number,
      default: 0,
    },
    other: {
      type: Number,
      default: 0,
    },
    otherUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

export const LeaveBalance = model<ILeaveBalance>("LeaveBalance", leaveBalanceSchema);
