import mongoose, { Schema, Document, Types } from 'mongoose';

interface ILeave extends Document {
    employee: Types.ObjectId;
    leaveType: 'casual' | 'sick' | 'annual' | 'maternity' | 'paternity' | 'unpaid';
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: Types.ObjectId;
    approvalDate?: Date;
    rejectionReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const leaveSchema = new Schema<ILeave>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid'],
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
        days: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        approvalDate: Date,
        rejectionReason: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILeave>('Leave', leaveSchema);