import { injectable } from "inversify";
import { AttendanceModel } from "./attendance.schema";
import {
  IAttendance,
  IAttendanceInput,
  IAttendanceFilter,
  IAttendanceSummary,
} from "../../domain/entities/Attendance.entity";
import { IAttendanceRepository } from "../../application/ports/AttendanceRepository.port";
import { AppError } from "../../shared/utils/error-handler.util";

@injectable()
export class AttendanceRepository implements IAttendanceRepository {
  async create(attendance: IAttendanceInput): Promise<IAttendance> {
    const existingAttendance = await AttendanceModel.findOne({
      organizationId: attendance.organizationId,
      employeeId: attendance.employeeId,
      date: {
        $gte: new Date(attendance.date.setHours(0, 0, 0, 0)),
        $lt: new Date(attendance.date.setHours(23, 59, 59, 999)),
      },
    });

    if (existingAttendance) {
      throw new AppError(
        "Attendance already exists for this date",
        409
      );
    }

    const record = new AttendanceModel(attendance);
    return record.save();
  }

  async findById(
    id: string,
    organizationId: string
  ): Promise<IAttendance | null> {
    return AttendanceModel.findOne({
      _id: id,
      organizationId,
    }).exec();
  }

  async findByEmployeeAndDate(
    employeeId: string,
    organizationId: string,
    date: Date
  ): Promise<IAttendance | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return AttendanceModel.findOne({
      organizationId,
      employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).exec();
  }

  async update(
    id: string,
    organizationId: string,
    attendance: Partial<IAttendanceInput>
  ): Promise<IAttendance | null> {
    return AttendanceModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: attendance },
      { new: true, runValidators: true }
    ).exec();
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await AttendanceModel.deleteOne({
      _id: id,
      organizationId,
    }).exec();

    return result.deletedCount === 1;
  }

  async findByFilters(filters: IAttendanceFilter): Promise<IAttendance[]> {
    const query: any = { organizationId: filters.organizationId };

    if (filters.employeeId) {
      query.employeeId = filters.employeeId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }

    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);

    return AttendanceModel.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(filters.limit || 10)
      .exec();
  }

  async findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<IAttendance[]> {
    const query: any = {
      organizationId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    return AttendanceModel.find(query).sort({ date: -1 }).exec();
  }

  async getAttendanceSummary(
    employeeId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAttendanceSummary> {
    const records = await AttendanceModel.find({
      organizationId,
      employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();

    const summary: IAttendanceSummary = {
      totalPresent: 0,
      totalAbsent: 0,
      totalLeave: 0,
      totalLate: 0,
      totalHalfDay: 0,
      workingHours: 0,
      overtimeHours: 0,
    };

    records.forEach((record) => {
      switch (record.status) {
        case "present":
          summary.totalPresent++;
          break;
        case "absent":
          summary.totalAbsent++;
          break;
        case "leave":
          summary.totalLeave++;
          break;
        case "late":
          summary.totalLate++;
          break;
        case "half-day":
          summary.totalHalfDay++;
          break;
      }

      summary.workingHours += record.workHours || 0;
      summary.overtimeHours += record.overtime || 0;
    });

    return summary;
  }

  async bulkUpsert(
    attendances: IAttendanceInput[],
    organizationId: string
  ): Promise<IAttendance[]> {
    const operations = attendances.map((attendance) => ({
      updateOne: {
        filter: {
          organizationId,
          employeeId: attendance.employeeId,
          date: {
            $gte: new Date(attendance.date.setHours(0, 0, 0, 0)),
            $lt: new Date(attendance.date.setHours(23, 59, 59, 999)),
          },
        },
        update: { $set: attendance as any },
        upsert: true,
      },
    }));

    await AttendanceModel.bulkWrite(operations as any);

    return this.findByDateRange(
      organizationId,
      new Date(Math.min(...attendances.map((a) => a.date.getTime()))),
      new Date(Math.max(...attendances.map((a) => a.date.getTime())))
    );
  }

  async approveAttendance(
    id: string,
    organizationId: string,
    approvedBy: string
  ): Promise<IAttendance | null> {
    return AttendanceModel.findOneAndUpdate(
      { _id: id, organizationId },
      {
        $set: {
          isApproved: true,
          approvedBy,
          approvedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }
}
