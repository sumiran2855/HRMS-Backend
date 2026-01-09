import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    email: string;
    password: string;
    role: "admin" | "hr" | "manager" | "finance" | "employee";
    employee?: mongoose.Types.ObjectId;
    isActive: boolean;
    lastLogin?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "hr", "manager", "finance", "employee"],
            default: "employee",
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
