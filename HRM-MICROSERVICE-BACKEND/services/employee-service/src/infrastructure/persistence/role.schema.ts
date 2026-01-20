import mongoose, { Schema, Document } from "mongoose";
import { IRole } from "../../domain/entities/Role.entity";

export interface IRoleDocument extends IRole, Document {}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    organizationId: {
      type: String,
      required: true,
      default: "default",
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export const RoleModel = mongoose.model<IRoleDocument>("Role", RoleSchema);
