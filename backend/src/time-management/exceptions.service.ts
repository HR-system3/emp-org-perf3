import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TimeException,
  TimeExceptionDocument,
} from './models/time-exception.schema';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from './models/attendance-record.schema';
import { CreateTimeExceptionDto, ReviewTimeExceptionDto } from './dto/exception.dto';
import { TimeExceptionStatus } from './models/enums';

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectModel(TimeException.name)
    private readonly exceptionModel: Model<TimeExceptionDocument>,
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
  ) {}

  async createException(dto: CreateTimeExceptionDto) {
    const attendance = await this.attendanceModel.findById(dto.attendanceRecordId);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const exception = await this.exceptionModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      type: dto.type,
      attendanceRecordId: attendance._id,
      assignedTo: new Types.ObjectId(dto.assignedTo),
      status: TimeExceptionStatus.OPEN,
      reason: dto.reason,
    });

    // link to attendance record
    attendance.exceptionIds = attendance.exceptionIds || [];
    attendance.exceptionIds.push(exception._id);
    await attendance.save();

    return exception;
  }

  async reviewException(id: string, dto: ReviewTimeExceptionDto) {
    const exception = await this.exceptionModel.findById(id);
    if (!exception) {
      throw new NotFoundException('Time exception not found');
    }

    exception.status = dto.status;
    if (dto.reason) {
      exception.reason = dto.reason;
    }

    return exception.save();
  }

  /**
   * Simple "sync to payroll" payload:
   * For MS2 we just return all APPROVED exceptions.
   */
  async buildPayrollSyncPayload() {
    const approved = await this.exceptionModel
      .find({ status: TimeExceptionStatus.APPROVED })
      .lean();

    // Shape as a simplified payload that Payroll team can consume
    return approved.map((ex) => ({
      employeeId: ex.employeeId,
      attendanceRecordId: ex.attendanceRecordId,
      type: ex.type,
      status: ex.status,
      reason: ex.reason,
    }));
  }
}
