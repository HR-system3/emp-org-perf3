import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from './models/attendance-record.schema';
import { TimeReportFilterDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
  ) {}

  async getAttendanceReport(filter: TimeReportFilterDto) {
    const query: any = {};

    if (filter.employeeId) {
      query.employeeId = new Types.ObjectId(filter.employeeId);
    }

    if (filter.fromDate || filter.toDate) {
      const dateFilter: any = {};
      if (filter.fromDate) dateFilter.$gte = new Date(filter.fromDate);
      if (filter.toDate) dateFilter.$lte = new Date(filter.toDate);
      query['punches.time'] = dateFilter;
    }

    const records = await this.attendanceModel.find(query).lean();

    // Build a simple, export-ready summary
    return records.map((r) => {
      const punches = r.punches || [];
      const sorted = [...punches].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );
      const firstPunch = sorted[0];
      const lastPunch = sorted[sorted.length - 1];

      return {
        employeeId: r.employeeId,
        punchesCount: punches.length,
        firstPunchTime: firstPunch?.time ?? null,
        lastPunchTime: lastPunch?.time ?? null,
        totalWorkMinutes: r.totalWorkMinutes,
        hasMissedPunch: r.hasMissedPunch,
        finalisedForPayroll: r.finalisedForPayroll,
      };
    });
  }
}
