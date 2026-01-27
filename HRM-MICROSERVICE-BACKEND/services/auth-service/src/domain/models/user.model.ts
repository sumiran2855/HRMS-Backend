import mongoose, { Schema, Document } from "mongoose";
import { RoleEnum } from "../entities/Role.entity";

export interface IUser extends Document {
  email: string;
  username?: string;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: false,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.EMPLOYEE,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(password, this.password as string);
};

export const User = mongoose.model<IUser>("User", UserSchema);
