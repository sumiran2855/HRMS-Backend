import mongoose, { Schema, Document, Types } from 'mongoose';

interface IPayroll extends Document {
    employee: Types.ObjectId;
    month: number;
    year: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    earnings: {
        basic: number;
        hra: number;
        transport: number;
        medical: number;
        other: number;
        overtime: number;
        bonus: number;
    };
    deductions: {
        tax: number;
        providentFund: number;
        insurance: number;
        lateDeduction: number;
        other: number;
    };
    grossSalary: number;
    netSalary: number;
    status: 'draft' | 'processed' | 'paid';
    paymentDate?: Date;
    paymentMethod?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
const payrollSchema = new Schema<IPayroll>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        workingDays: Number,
        presentDays: Number,
        absentDays: Number,
        leaveDays: Number,
        earnings: {
            basic: Number,
            hra: Number,
            transport: Number,
            medical: Number,
            other: Number,
            overtime: Number,
            bonus: Number,
        },
        deductions: {
            tax: Number,
            providentFund: Number,
            insurance: Number,
            lateDeduction: Number,
            other: Number
        },
        grossSalary: Number,
        netSalary: Number,
        status: {
            type: String,
            enum: ['draft', 'processed', 'paid'],
            default: 'draft'
        },
        paymentDate: Date,
        paymentMethod: String
    }, {
    timestamps: true
}
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
export default mongoose.model<IPayroll>('Payroll', payrollSchema);