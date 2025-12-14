import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ShiftType,
  ShiftTypeDocument,
} from './models/shift-type.schema';
import { Shift, ShiftDocument } from './models/shift.schema';
import {
  ShiftAssignment,
  ShiftAssignmentDocument,
} from './models/shift-assignment.schema';
import {
  ShiftAssignmentStatus,
} from './models/enums';
import {
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
  CreateShiftDto,
  UpdateShiftDto,
  AssignShiftDto,
  GetAssignmentsQueryDto,
} from './dto/shifts.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(ShiftType.name)
    private readonly shiftTypeModel: Model<ShiftTypeDocument>,
    @InjectModel(Shift.name)
    private readonly shiftModel: Model<ShiftDocument>,
    @InjectModel(ShiftAssignment.name)
    private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
  ) {}

  // ===== Shift Types =====

  createShiftType(dto: CreateShiftTypeDto) {
    const created = new this.shiftTypeModel({
      name: dto.name,
      active: true,
    });
    return created.save();
  }

  getShiftTypes() {
    return this.shiftTypeModel.find().lean();
  }

  async updateShiftType(id: string, dto: UpdateShiftTypeDto) {
    const shiftType = await this.shiftTypeModel.findById(id);
    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    if (dto.name !== undefined) shiftType.name = dto.name;
    if (dto.active !== undefined) shiftType.active = dto.active;

    return shiftType.save();
  }

  async deleteShiftType(id: string) {
    const shiftType = await this.shiftTypeModel.findById(id);
    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    // Soft delete by deactivating
    shiftType.active = false;
    return shiftType.save();
  }

  // ===== Shifts =====

  async createShift(dto: CreateShiftDto) {
    const shiftTypeId = new Types.ObjectId(dto.shiftTypeId);

    const created = new this.shiftModel({
      name: dto.name,
      shiftType: shiftTypeId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      punchPolicy: dto.punchPolicy,
      graceInMinutes: dto.graceInMinutes ?? 0,
      graceOutMinutes: dto.graceOutMinutes ?? 0,
      requiresApprovalForOvertime: dto.requiresApprovalForOvertime ?? false,
      active: true,
    });

    return created.save();
  }

  getShifts() {
    return this.shiftModel.find().populate('shiftType').lean();
  }

  async getShiftById(id: string) {
    const shift = await this.shiftModel.findById(id).populate('shiftType').lean();
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return shift;
  }

  async updateShift(id: string, dto: UpdateShiftDto) {
    const shift = await this.shiftModel.findById(id);
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (dto.name !== undefined) shift.name = dto.name;
    if (dto.shiftTypeId !== undefined) {
      shift.shiftType = new Types.ObjectId(dto.shiftTypeId);
    }
    if (dto.startTime !== undefined) shift.startTime = dto.startTime;
    if (dto.endTime !== undefined) shift.endTime = dto.endTime;
    if (dto.punchPolicy !== undefined) shift.punchPolicy = dto.punchPolicy;
    if (dto.graceInMinutes !== undefined)
      shift.graceInMinutes = dto.graceInMinutes;
    if (dto.graceOutMinutes !== undefined)
      shift.graceOutMinutes = dto.graceOutMinutes;
    if (dto.requiresApprovalForOvertime !== undefined)
      shift.requiresApprovalForOvertime = dto.requiresApprovalForOvertime;
    if (dto.active !== undefined) shift.active = dto.active;

    return shift.save();
  }

  async deleteShift(id: string) {
    const shift = await this.shiftModel.findById(id);
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Soft delete by deactivating
    shift.active = false;
    return shift.save();
  }

  // ===== Shift Assignments =====

  async assignShift(dto: AssignShiftDto) {
    const hasTarget =
      !!dto.employeeId || !!dto.departmentId || !!dto.positionId;

    if (!hasTarget) {
      throw new BadRequestException(
        'At least one of employeeId, departmentId or positionId must be provided',
      );
    }

    const payload: any = {
      shiftId: new Types.ObjectId(dto.shiftId),
      startDate: new Date(dto.startDate),
    };

    if (dto.endDate) {
      payload.endDate = new Date(dto.endDate);
    }
    if (dto.employeeId) {
      payload.employeeId = new Types.ObjectId(dto.employeeId);
    }
    if (dto.departmentId) {
      payload.departmentId = new Types.ObjectId(dto.departmentId);
    }
    if (dto.positionId) {
      payload.positionId = new Types.ObjectId(dto.positionId);
    }
    if (dto.scheduleRuleId) {
      payload.scheduleRuleId = new Types.ObjectId(dto.scheduleRuleId);
    }

    const created = new this.shiftAssignmentModel(payload);
    return created.save();
  }

  async getAssignments(query: GetAssignmentsQueryDto) {
    const filter: any = {};

    if (query.employeeId) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }
    if (query.departmentId) {
      filter.departmentId = new Types.ObjectId(query.departmentId);
    }
    if (query.positionId) {
      filter.positionId = new Types.ObjectId(query.positionId);
    }

    if (query.date) {
      const d = new Date(query.date);
      filter.startDate = { $lte: d };
      filter.$or = [
        { endDate: { $gte: d } },
        { endDate: { $exists: false } },
        { endDate: null },
      ];
    }

    return this.shiftAssignmentModel
      .find(filter)
      .populate('shiftId')
      .lean();
  }

  /**
   * Helper for attendance: get the active shift assignment for an employee on a given date
   */
  async getEmployeeShiftForDate(employeeId: string, date?: string) {
    const d = date ? new Date(date) : new Date();

    const filter: any = {
      employeeId: new Types.ObjectId(employeeId),
      status: { $ne: ShiftAssignmentStatus.EXPIRED },
      startDate: { $lte: d },
      $or: [
        { endDate: { $gte: d } },
        { endDate: { $exists: false } },
        { endDate: null },
      ],
    };

    const assignment = await this.shiftAssignmentModel
      .findOne(filter)
      .sort({ startDate: -1 })
      .populate('shiftId')
      .lean();

    if (!assignment) {
      throw new NotFoundException(
        'No active shift assignment found for this employee on the given date',
      );
    }

    return assignment;
  }
}