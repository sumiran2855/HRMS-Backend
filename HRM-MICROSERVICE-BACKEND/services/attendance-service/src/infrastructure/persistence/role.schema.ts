import { Schema, model, Document } from "mongoose";

export interface RoleDocument extends Document {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      required: true,
      default: true,
    },
    organizationId: {
      type: String,
      required: true,
      default: "default",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.index({ name: 1, organizationId: 1 }, { unique: true });
roleSchema.index({ organizationId: 1, isActive: 1 });

export const RoleModel = model<RoleDocument>("Role", roleSchema);
