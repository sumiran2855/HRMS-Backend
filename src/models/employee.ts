import mongoose, { Schema, Document } from "mongoose";

interface IEmployee extends Document {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    department: string;
    designation: string;
    joiningDate: Date;
    employmentType: "full-time" | "part-time" | "contract" | "intern";
    manager?: mongoose.Types.ObjectId;
    salary: {
        basic: number;
        allowances: {
            hra: number;
            transport: number;
            medical: number;
            other: number;
        };
        deductions: {
            tax: number;
            providentFund: number;
            insurance: number;
            other: number;
        };
    };
    bankDetails: {
        accountNumber: string;
        bankName: string;
        ifscCode: string;
        branch: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
    status: "active" | "inactive" | "terminated" | "resigned";
    profileImage?: string;
    position: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const employeeSchema = new Schema<IEmployee>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            zipCode: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        joiningDate: {
            type: Date,
            required: true,
        },
        employmentType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "intern"],
            required: true,
        },
        manager: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
        salary: {
            basic: { type: Number, required: true, min: 0 },
            allowances: {
                hra: { type: Number, default: 0, min: 0 },
                transport: { type: Number, default: 0, min: 0 },
                medical: { type: Number, default: 0, min: 0 },
                other: { type: Number, default: 0, min: 0 },
            },
            deductions: {
                tax: { type: Number, default: 0, min: 0 },
                providentFund: { type: Number, default: 0, min: 0 },
                insurance: { type: Number, default: 0, min: 0 },
                other: { type: Number, default: 0, min: 0 },
            },
        },
        bankDetails: {
            accountNumber: { type: String, required: true, trim: true },
            bankName: { type: String, required: true, trim: true },
            ifscCode: { type: String, required: true, trim: true },
            branch: { type: String, required: true, trim: true },
        },
        emergencyContact: {
            name: { type: String, required: true, trim: true },
            relationship: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
        },
        status: {
            type: String,
            enum: ["active", "inactive", "terminated", "resigned"],
            default: "active",
        },
        profileImage: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);