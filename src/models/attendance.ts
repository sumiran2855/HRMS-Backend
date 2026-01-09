import mongoose, { Schema, Document, Types } from 'mongoose';

interface IAttendance extends Document {
    employee: Types.ObjectId;
    date: Date;
    checkIn: Date;
    checkOut: Date;
    workingHours: number;
    status: 'present' | 'absent' | 'half-day' | 'leave' | 'holiday';
    remarks: string;
    location: {
        checkIn: string;
        checkOut: string;
    };
}
const attendanceSchema = new Schema<IAttendance>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        checkIn: Date,
        checkOut: Date,
        workingHours: Number,
        status: {
            type: String,
            enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
            default: 'absent',
        },
        remarks: String,
        location: {
            checkIn: String,
            checkOut: String,
        },
    },
    {
        timestamps: true,
    }
);
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
export default mongoose.model<IAttendance>('Attendance', attendanceSchema);