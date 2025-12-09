// src/leaves/leaves.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema';
import {
  LeaveType,
  LeaveTypeDocument,
} from './models/leave-type.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import {
  ManagerDelegation,
  ManagerDelegationDocument,
} from './models/manager-delegation.schema';
import {
  LeaveAuditLog,
  LeaveAuditLogDocument,
  AuditAction,
} from './models/leave-audit-log.schema';
import {
  ApprovalConfig,
  ApprovalConfigDocument,
} from './models/approval-config.schema';

import { LeaveStatus } from './enums/leave-status.enum';
import { AccrualMethod } from './enums/accrual-method.enum';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequestDocument>,

    @InjectModel(LeaveType.name)
    private readonly leaveTypeModel: Model<LeaveTypeDocument>,

    @InjectModel(LeaveEntitlement.name)
    private readonly leaveEntitlementModel: Model<LeaveEntitlementDocument>,

    @InjectModel(LeaveAdjustment.name)
    private readonly leaveAdjustmentModel: Model<LeaveAdjustmentDocument>,

    @InjectModel(Calendar.name)
    private readonly calendarModel: Model<CalendarDocument>,

    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,

    @InjectModel(ManagerDelegation.name)
    private readonly managerDelegationModel: Model<ManagerDelegationDocument>,

    @InjectModel(LeaveAuditLog.name)
    private readonly leaveAuditLogModel: Model<LeaveAuditLogDocument>,

    @InjectModel(ApprovalConfig.name)
    private readonly approvalConfigModel: Model<ApprovalConfigDocument>,
  ) {}

  // ======================================================
  // EMPLOYEE FUNCTIONS
  // ======================================================

  async createLeaveRequest(
    employeeId: Types.ObjectId,
    requestedBy: Types.ObjectId,
    dto: any,
  ) {
    const leaveType = await this.leaveTypeModel.findById(dto.leaveTypeId);
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start)
      throw new BadRequestException('End date must be after start date');

    // Business Rule: Eligibility check (tenure, contract type)
    await this.validateEligibility(employee, leaveType);

    // Business Rule: Notice period validation
    await this.validateNoticePeriod(employee, start);

    // Business Rule: Blocked periods check (REQ-010)
    await this.validateBlockedPeriods(start, end);

    const totalDays = this.calculateTotalDays(start, end);

    if ((leaveType as any).maxDurationDays && totalDays > (leaveType as any).maxDurationDays) {
      throw new BadRequestException(
        'Requested duration exceeds allowed maximum',
      );
    }

    const totalWorkingDays = await this.calculateWorkingDays(
      employeeId,
      start,
      end,
    );

    // Business Rule: Sick leave limit (360 days over 3 years)
    if ((leaveType as any).code === 'SICK') {
      await this.validateSickLeaveLimit(employeeId, totalWorkingDays);
    }

    // Business Rule: Maternity leave tracking
    if ((leaveType as any).code === 'MATERNITY') {
      await this.validateMaternityLeave(employee, start, end);
    }

    // Business Rule: Special leave types (Hajj/Mission/Wedding/etc.)
    await this.validateSpecialLeaveRules(employee, leaveType as any, start, end, dto);

    const overlap = await this.hasOverlappingLeaves(
      employeeId,
      start,
      end,
    );

    if (overlap)
      throw new BadRequestException(
        'Request overlaps with existing approved/pending leave',
      );

    // Business Rule: Post-leave submission grace period check
    if (dto.isPostLeaveSubmission) {
      await this.validatePostLeaveSubmissionGracePeriod(employee, start);
    }

    // Business Rule: Check balance and convert excess to unpaid if needed (BR 29)
    const balanceCheck = await this.checkBalanceAndConvertToUnpaid(
      employeeId,
      (leaveType as any)._id,
      totalWorkingDays,
    );

    // Get approval configuration (multi-level support)
    const approvalConfig = await this.getApprovalConfig(employee, leaveType as any);
    const approvalFlow = await this.buildApprovalFlow(approvalConfig, employee);

    const leaveRequest = new this.leaveRequestModel({
      employeeId,
      leaveTypeId: (leaveType as any)._id,
      startDate: start,
      endDate: end,
      totalDays,
      totalWorkingDays,
      justification: dto.justification,
      attachments: dto.attachmentIds ?? [],
      status: LeaveStatus.PENDING,
      approvalFlow,
      requestedBy,
      isPostLeaveSubmission: dto.isPostLeaveSubmission ?? false,
      convertedToUnpaidDays: balanceCheck.convertedToUnpaidDays || null,
      meta: {
        balanceCheck: balanceCheck,
        approvalConfigCode: (approvalConfig as any)?.code,
        escalationLevel: 0,
        lastEscalationCheck: new Date(),
      },
    });

    const savedRequest = await leaveRequest.save();

    // Create audit log for submission
   await this.createAuditLog(
   savedRequest._id,
   AuditAction.SUBMITTED,
   requestedBy,
   undefined,
   savedRequest.toObject(),
   'Leave request submitted by employee',);


    return savedRequest;
  }

  async updatePendingRequest(employeeId: Types.ObjectId, requestId: string, dto: any) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');

    if (!(request as any).employeeId.equals(employeeId)) {
      throw new ForbiddenException('You can only update your own requests');
    }

    if ((request as any).status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    const oldState = request.toObject();

    if (dto.startDate || dto.endDate) {
      const start = dto.startDate ? new Date(dto.startDate) : (request as any).startDate;
      const end = dto.endDate ? new Date(dto.endDate) : (request as any).endDate;

      if (end < start)
        throw new BadRequestException('End date must be after start date');

      (request as any).startDate = start;
      (request as any).endDate = end;
      (request as any).totalDays = this.calculateTotalDays(start, end);
      (request as any).totalWorkingDays = await this.calculateWorkingDays(
        employeeId,
        start,
        end,
      );
    }

    if (dto.justification !== undefined) {
      (request as any).justification = dto.justification;
    }

    if (dto.attachmentIds) {
      (request as any).attachments = dto.attachmentIds as any;
    }

    const savedRequest = await request.save();

    await this.createAuditLog(
      (request as any)._id,
      AuditAction.EDITED,
      (request as any).requestedBy,
      oldState,
      savedRequest.toObject(),
      'Request updated by employee',
    );

    return savedRequest;
  }

  async cancelPendingRequest(employeeId: Types.ObjectId, requestId: string) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Leave request not found');

    if (!(request as any).employeeId.equals(employeeId)) {
      throw new ForbiddenException('This is not your request');
    }

    if ((request as any).status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests may be canceled');
    }

    const oldState = request.toObject();

    (request as any).status = LeaveStatus.CANCELLED;
    (request as any).decisionReason = 'Cancelled by employee';

    const savedRequest = await request.save();

    await this.createAuditLog(
      (request as any)._id,
      AuditAction.CANCELLED,
      (request as any).requestedBy,
      oldState,
      savedRequest.toObject(),
      'Cancelled by employee',
    );

    return savedRequest;
  }

  async getEmployeeBalance(employeeId: Types.ObjectId) {
    const entitlements = await this.leaveEntitlementModel.find({ employeeId });
    const adjustments = await this.leaveAdjustmentModel.find({ employeeId });

    const approvedLeaves = await this.leaveRequestModel.find({
      employeeId,
      status: LeaveStatus.APPROVED,
    });

    const results: any[] = [];

    for (const ent of entitlements) {
      const leaveTypeId = (ent as any).leaveTypeId.toString();

      const used = approvedLeaves
        .filter((r) => (r as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, r) => sum + ((r as any).totalWorkingDays ?? (r as any).totalDays), 0);

      const adjust = adjustments
        .filter((a) => (a as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, a) => sum + (a as any).change, 0);

      results.push({
        leaveTypeId,
        entitlementDays: (ent as any).entitlementDays,
        usedDays: used,
        adjustmentTotal: adjust,
        remaining: (ent as any).entitlementDays + adjust - used,
      });
    }

    return results;
  }

  async getEmployeeHistory(employeeId: Types.ObjectId) {
    return this.leaveRequestModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ======================================================
  // MANAGER FUNCTIONS
  // ======================================================
  async managerApproveReject(
  managerId: Types.ObjectId,
  requestId: string,
  dto: any,
) {
  const request = await this.leaveRequestModel.findById(requestId);
  if (!request) throw new NotFoundException('Leave request not found');

  const employee = await this.employeeProfileModel.findById(request.employeeId);
  if (!employee) throw new NotFoundException('Employee not found');

  // Check manager allowed to approve
  const canApprove = await this.canApproveStep(
    managerId,
    request.approvalFlow.find((s) => s.status === 'PENDING'),
    employee,
  );

  if (!canApprove) {
    throw new ForbiddenException('You are not authorized to approve this request');
  }

  const pendingStep = request.approvalFlow.find((s) => s.status === 'PENDING');
  if (!pendingStep) throw new BadRequestException('No pending approval step');

  const old = request.toObject();

  if (dto.action === 'APPROVE') {
    pendingStep.status = 'APPROVED';

    const nextStep = request.approvalFlow.find(
      (s) => s.level === pendingStep.level + 1,
    );

    if (nextStep) {
      nextStep.status = 'PENDING';
      request.status = LeaveStatus.UNDER_REVIEW;
    } else {
      request.status = LeaveStatus.APPROVED;
    }
  } else {
    pendingStep.status = 'REJECTED';
    request.status = LeaveStatus.REJECTED;
    request.decisionReason = dto.reason || 'Rejected by manager';
  }

  const saved = await request.save();

  await this.createAuditLog(
    request._id,
    dto.action === 'APPROVE' ? AuditAction.APPROVED : AuditAction.REJECTED,
    managerId,
    old,
    saved.toObject(),
    'Manager decision',
  );

  return saved;
}

  // Return pending + under-review + approved team requests (basic filter)
  async getTeamRequests(managerId: Types.ObjectId, filters?: any) {
    // NOTE: your org-structure mapping to employees is outside Leaves.
    // Here we support passing employeeIds in filters.managerEmployeeIds or rely on a naive strategy.
    const query: any = {
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.UNDER_REVIEW, LeaveStatus.APPROVED] },
    };

    if (filters?.employeeIds) {
      query.employeeId = { $in: filters.employeeIds.map((id: string) => new Types.ObjectId(id)) };
    }
    if (filters?.leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      query.startDate = {};
      if (filters?.dateFrom) query.startDate.$gte = new Date(filters.dateFrom);
      if (filters?.dateTo) query.startDate.$lte = new Date(filters.dateTo);
    }

    return this.leaveRequestModel.find(query).sort({ startDate: 1 }).lean();
  }

  // Aggregate team balances (accept employeeIds list)
  async getTeamBalances(managerId: Types.ObjectId, employeeIds: string[]) {
    const empIds = (employeeIds || []).map((id) => new Types.ObjectId(id));
    const entitlements = await this.leaveEntitlementModel.find({
      employeeId: { $in: empIds },
    });
    const adjustments = await this.leaveAdjustmentModel.find({
      employeeId: { $in: empIds },
    });
    const approvedLeaves = await this.leaveRequestModel.find({
      employeeId: { $in: empIds },
      status: LeaveStatus.APPROVED,
    });

    const byEmployee: Record<string, any> = {};

    for (const ent of entitlements) {
      const empId = (ent as any).employeeId.toString();
      byEmployee[empId] = byEmployee[empId] || { employeeId: empId, balances: [] };

      const leaveTypeId = (ent as any).leaveTypeId.toString();

      const used = approvedLeaves
        .filter((r) => (r as any).employeeId.toString() === empId && (r as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, r) => sum + ((r as any).totalWorkingDays ?? (r as any).totalDays), 0);

      const adjust = adjustments
        .filter((a) => (a as any).employeeId.toString() === empId && (a as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, a) => sum + (a as any).change, 0);

      byEmployee[empId].balances.push({
        leaveTypeId,
        entitlementDays: (ent as any).entitlementDays,
        usedDays: used,
        adjustmentTotal: adjust,
        remaining: (ent as any).entitlementDays + adjust - used,
      });
    }

    return Object.values(byEmployee);
  }

  // Team history: get all requests for provided employeeIds
  async getTeamHistory(managerId: Types.ObjectId, employeeIds: string[], filters?: any) {
    const empIds = (employeeIds || []).map((id) => new Types.ObjectId(id));
    const query: any = { employeeId: { $in: empIds } };

    if (filters?.status) query.status = filters.status;
    if (filters?.leaveTypeId) query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    if (filters?.dateFrom || filters?.dateTo) {
      query.startDate = {};
      if (filters?.dateFrom) query.startDate.$gte = new Date(filters.dateFrom);
      if (filters?.dateTo) query.startDate.$lte = new Date(filters.dateTo);
    }

    return this.leaveRequestModel.find(query).sort({ startDate: -1 }).lean();
  }

  // ======================================================
  // HR FUNCTIONS (OVERVIEW / DASHBOARD)
  // ======================================================

  // Get all requests with filters for HR dashboard
  async getAllRequests(filters?: any) {
    const query: any = {};

    if (filters?.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
    if (filters?.leaveTypeId) query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    if (filters?.status) query.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      query.startDate = {};
      if (filters?.dateFrom) query.startDate.$gte = new Date(filters.dateFrom);
      if (filters?.dateTo) query.startDate.$lte = new Date(filters.dateTo);
    }

    return this.leaveRequestModel.find(query).sort({ createdAt: -1 }).lean();
  }

  // HR aggregated balances across all employees (with optional filters)
  async getAllBalances(filters?: any) {
    const queryEmp: any = {};
    if (filters?.employeeIds) {
      queryEmp.employeeId = { $in: filters.employeeIds.map((id: string) => new Types.ObjectId(id)) };
    }

    const entitlements = await this.leaveEntitlementModel.find(queryEmp);
    const adjustments = await this.leaveAdjustmentModel.find(queryEmp);
    const approvedLeaves = await this.leaveRequestModel.find({
      status: LeaveStatus.APPROVED,
    });

    const byEmployee: Record<string, any> = {};

    for (const ent of entitlements) {
      const empId = (ent as any).employeeId.toString();
      byEmployee[empId] = byEmployee[empId] || { employeeId: empId, balances: [] };

      const leaveTypeId = (ent as any).leaveTypeId.toString();

      const used = approvedLeaves
        .filter((r) => (r as any).employeeId.toString() === empId && (r as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, r) => sum + ((r as any).totalWorkingDays ?? (r as any).totalDays), 0);

      const adjust = adjustments
        .filter((a) => (a as any).employeeId.toString() === empId && (a as any).leaveTypeId.toString() === leaveTypeId)
        .reduce((sum, a) => sum + (a as any).change, 0);

      byEmployee[empId].balances.push({
        leaveTypeId,
        entitlementDays: (ent as any).entitlementDays,
        usedDays: used,
        adjustmentTotal: adjust,
        remaining: (ent as any).entitlementDays + adjust - used,
      });
    }

    return Object.values(byEmployee);
  }

  // HR pattern detection: irregular leave patterns (simple heuristics)
  async detectIrregularPatternsForManager(managerId: Types.ObjectId, employeeIds: string[]) {
    // For each employee compute:
    // - count of short leaves (<=1 day) in last 90 days
    // - count of leaves that start on Monday or Friday in last 180 days
    // - frequency score
    const now = new Date();
    const shortWindowStart = new Date(now);
    shortWindowStart.setDate(now.getDate() - 90);

    const midWindowStart = new Date(now);
    midWindowStart.setDate(now.getDate() - 180);

    const empIds = (employeeIds || []).map((id) => new Types.ObjectId(id));

    const recentLeaves = await this.leaveRequestModel.find({
      employeeId: { $in: empIds },
      status: LeaveStatus.APPROVED,
      startDate: { $gte: midWindowStart },
    }).lean();

    const report: any[] = [];

    for (const empId of empIds) {
      const leaves = recentLeaves.filter(l => (l as any).employeeId.toString() === empId.toString());

      const shortLeaves = leaves.filter(l => ((l as any).totalWorkingDays ?? (l as any).totalDays) <= 1 && new Date((l as any).startDate) >= shortWindowStart).length;
      const monFriLeaves = leaves.filter(l => {
        const dow = new Date((l as any).startDate).getDay();
        return dow === 1 || dow === 5;
      }).length;

      const total = leaves.length;
      const score = (shortLeaves * 2) + monFriLeaves + total;

      report.push({
        employeeId: empId.toString(),
        totalLeaves: total,
        shortLeaves,
        monFriLeaves,
        score,
      });
    }

    return report.sort((a,b) => b.score - a.score);
  }

  // ======================================================
  // CALENDAR & HOLIDAY MANAGEMENT (GLOBAL calendar mode)
  // ======================================================

  async createCalendar(dto: any) {
    // Global calendar uses year-only unless you later add country
    const existing = await this.calendarModel.findOne({
      year: dto.year,
    });

    if (existing) {
      throw new BadRequestException(`Calendar for year ${dto.year} already exists`);
    }

    const calendar = new this.calendarModel({
      name: dto.name || `Global ${dto.year}`,
      year: dto.year,
      holidays: dto.holidays || [],
      blockedPeriods: dto.blockedPeriods || [],
    });

    return calendar.save();
  }

  async updateCalendar(calendarId: string, dto: any) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (dto.holidays !== undefined) {
      (calendar as any).holidays = dto.holidays;
    }

    if (dto.blockedPeriods !== undefined) {
      await this.validateBlockedPeriodsOverlap(dto.blockedPeriods);
      (calendar as any).blockedPeriods = dto.blockedPeriods;
    }

    if (dto.name !== undefined) (calendar as any).name = dto.name;

    return calendar.save();
  }

  async getCalendar(calendarId: string) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');
    return calendar;
  }

  // Updated signature to accept country filter too (controller calls with { country, year })
  async getCalendars(filters?: { country?: string; year?: number }) {
    const query: any = {};
    if (filters?.country) query.country = filters.country;
    if (filters?.year) query.year = filters.year;
    return this.calendarModel.find(query).sort({ year: -1 });
  }

  async deleteCalendar(calendarId: string) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');
    return this.calendarModel.findByIdAndDelete(calendarId);
  }

  async addHoliday(calendarId: string, holiday: { name: string; date: Date; recurring?: boolean }) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');

    const holidayDate = new Date(holiday.date).toDateString();
    const existingHoliday = (calendar as any).holidays.find(
      (h: any) => new Date(h.date).toDateString() === holidayDate,
    );

    if (existingHoliday) {
      throw new BadRequestException('Holiday already exists on this date');
    }

    (calendar as any).holidays.push(holiday);
    return calendar.save();
  }

  async removeHoliday(calendarId: string, holidayDate: Date) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');

    const dateString = new Date(holidayDate).toDateString();
    (calendar as any).holidays = (calendar as any).holidays.filter(
      (h: any) => new Date(h.date).toDateString() !== dateString,
    );

    return calendar.save();
  }

  async addBlockedPeriod(calendarId: string, blockedPeriod: { start: Date; end: Date; reason?: string }) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');

    const newStart = new Date(blockedPeriod.start);
    const newEnd = new Date(blockedPeriod.end);

    if (newEnd < newStart) {
      throw new BadRequestException('End date must be after start date');
    }

    for (const existing of (calendar as any).blockedPeriods || []) {
      const existingStart = new Date(existing.start);
      const existingEnd = new Date(existing.end);

      if ((newStart <= existingEnd && newEnd >= existingStart) ||
          (existingStart <= newEnd && existingEnd >= newStart)) {
        throw new BadRequestException(`Blocked period overlaps with existing period: ${existing.reason || 'No reason provided'}`);
      }
    }

    (calendar as any).blockedPeriods.push(blockedPeriod);
    return calendar.save();
  }

  async removeBlockedPeriod(calendarId: string, startDate: Date, endDate: Date) {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) throw new NotFoundException('Calendar not found');

    const startString = new Date(startDate).toISOString();
    const endString = new Date(endDate).toISOString();

    (calendar as any).blockedPeriods = ((calendar as any).blockedPeriods || []).filter(
      (bp: any) =>
        new Date(bp.start).toISOString() !== startString ||
        new Date(bp.end).toISOString() !== endString,
    );

    return calendar.save();
  }

  private async validateBlockedPeriodsOverlap(blockedPeriods: { start: Date; end: Date }[]) {
    for (let i = 0; i < blockedPeriods.length; i++) {
      for (let j = i + 1; j < blockedPeriods.length; j++) {
        const period1 = blockedPeriods[i];
        const period2 = blockedPeriods[j];

        const start1 = new Date(period1.start);
        const end1 = new Date(period1.end);
        const start2 = new Date(period2.start);
        const end2 = new Date(period2.end);

        if (
          (start1 <= end2 && end1 >= start2) ||
          (start2 <= end1 && end2 >= start1)
        ) {
          throw new BadRequestException(
            `Blocked periods overlap: ${start1.toISOString()} - ${end1.toISOString()} overlaps with ${start2.toISOString()} - ${end2.toISOString()}`,
          );
        }
      }
    }
  }

  // ======================================================
  // INTERNAL HELPERS
  // ======================================================

  private calculateTotalDays(start: Date, end: Date): number {
    return (
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }

  // Global calendar working-days: uses calendar by year (no country)
  private async calculateWorkingDays(
    employeeId: Types.ObjectId,
    start: Date,
    end: Date,
  ) {
    const totalDays = this.calculateTotalDays(start, end);
    let workingDays = 0;

    // Find calendar for the year(s). For ranges spanning years, we check both
    const yearStart = start.getFullYear();
    const yearEnd = end.getFullYear();

    const calendars = await this.calendarModel.find({
      year: { $in: Array.from(new Set([yearStart, yearEnd])) },
    });

    const holidaysByYear = new Map<number, Set<string>>();
    for (const cal of calendars) {
      const holidays = (cal as any).holidays || [];
      holidaysByYear.set((cal as any).year, new Set(holidays.map((h:any) => new Date(h.date).toDateString())));
    }

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dow = currentDate.getDay();
      const ds = currentDate.toDateString();

      // Skip default weekend Saturday(6) & Sunday(0)
      if (dow !== 0 && dow !== 6) {
        const year = currentDate.getFullYear();
        const holidaySet = holidaysByYear.get(year);
        if (!holidaySet || !holidaySet.has(ds)) {
          workingDays++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  private async hasOverlappingLeaves(employeeId: Types.ObjectId, start: Date, end: Date) {
    const count = await this.leaveRequestModel.countDocuments({
      employeeId,
      status: {
        $in: [
          LeaveStatus.PENDING,
          LeaveStatus.APPROVED,
          LeaveStatus.UNDER_REVIEW,
        ],
      },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    return count > 0;
  }

  // ======================================================
  // BUSINESS RULES VALIDATION (SPECIAL LEAVES)
  // ======================================================

  private async validateSpecialLeaveRules(
    employee: EmployeeProfileDocument,
    leaveType: LeaveTypeDocument,
    start: Date,
    end: Date,
    dto: any,
  ) {
    // Example: Mission leave - not deducted from annual balance
    if ((leaveType as any).code === 'MISSION') {
      // ensure mission flag or justification present
      if (!dto.missionDetails) {
        throw new BadRequestException('Mission leave requires missionDetails');
      }
      return;
    }

    // Hajj / Wedding / Exam example: allow extra days if configured
    if ((leaveType as any).code === 'HAJJ') {
      // e.g., ensure only once per X years (not implemented here — placeholder)
      return;
    }

    // For Sick > 1 day require attachment
    if ((leaveType as any).code === 'SICK' && (this.calculateTotalDays(start, end) > 1)) {
      if (!dto.attachmentIds || dto.attachmentIds.length === 0) {
        throw new BadRequestException('Medical certificate required for sick leave > 1 day');
      }
    }
  }

  private async validateEligibility(
    employee: EmployeeProfileDocument,
    leaveType: LeaveTypeDocument,
  ) {
    if ((leaveType as any).minTenureMonths) {
      const hireDate = (employee as any).dateOfHire;
      const monthsSinceHire = this.calculateMonthsDifference(hireDate, new Date());

      if (monthsSinceHire < (leaveType as any).minTenureMonths) {
        throw new BadRequestException(
          `Minimum tenure of ${(leaveType as any).minTenureMonths} months required for this leave type`,
        );
      }
    }
  }

  private async validateNoticePeriod(
    employee: EmployeeProfileDocument,
    startDate: Date,
  ) {
    const noticeDays = 7; // can be made configurable per leave-type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const daysUntilStart = Math.floor(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilStart < noticeDays) {
      throw new BadRequestException(
        `Leave requests require at least ${noticeDays} days advance notice`,
      );
    }
  }

  private async validateBlockedPeriods(start: Date, end: Date) {
    const calendars = await this.calendarModel.find({
      $or: [
        { year: start.getFullYear() },
        { year: end.getFullYear() },
      ],
    });

    for (const calendar of calendars) {
      for (const blockedPeriod of (calendar as any).blockedPeriods || []) {
        const blockedStart = new Date(blockedPeriod.start);
        const blockedEnd = new Date(blockedPeriod.end);

        if (
          (start <= blockedEnd && end >= blockedStart) ||
          (blockedStart <= end && blockedEnd >= start)
        ) {
          throw new BadRequestException(
            `Leave cannot be taken during blocked period: ${blockedPeriod.reason || 'Blocked period'}`,
          );
        }
      }
    }
  }

  private async validateSickLeaveLimit(
    employeeId: Types.ObjectId,
    requestedDays: number,
  ) {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const sickLeaveType = await this.leaveTypeModel.findOne({ code: 'SICK' });
    if (!sickLeaveType) return;

    const usedSickLeaves = await this.leaveRequestModel.find({
      employeeId,
      leaveTypeId: (sickLeaveType as any)._id,
      status: LeaveStatus.APPROVED,
      startDate: { $gte: threeYearsAgo },
    });

    const totalUsedDays = usedSickLeaves.reduce(
      (sum, leave) => sum + ((leave as any).totalWorkingDays ?? (leave as any).totalDays),
      0,
    );

    if (totalUsedDays + requestedDays > 360) {
      throw new BadRequestException(
        `Sick leave limit exceeded. Maximum 360 days allowed over 3 years. Currently used: ${totalUsedDays} days`,
      );
    }
  }

  private async validateMaternityLeave(
    employee: EmployeeProfileDocument,
    start: Date,
    end: Date,
  ) {
    if ((employee as any).gender && (employee as any).gender !== 'FEMALE') {
      throw new BadRequestException('Maternity leave is only available for female employees');
    }

    const maternityLeaveType = await this.leaveTypeModel.findOne({ code: 'MATERNITY' });
    if (!maternityLeaveType) return;

    const existingMaternity = await this.leaveRequestModel.findOne({
      employeeId: (employee as any)._id,
      leaveTypeId: (maternityLeaveType as any)._id,
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.UNDER_REVIEW] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingMaternity) {
      throw new BadRequestException('Maternity leave already exists for this period');
    }
  }

  private async validatePostLeaveSubmissionGracePeriod(
    employee: EmployeeProfileDocument,
    startDate: Date,
  ) {
    const gracePeriodDays = 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceStart > gracePeriodDays) {
      throw new BadRequestException(
        `Post-leave submission must be within ${gracePeriodDays} days of leave start date`,
      );
    }
  }

  private async checkBalanceAndConvertToUnpaid(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
    requestedDays: number,
  ): Promise<{ hasBalance: boolean; convertedToUnpaidDays: number }> {
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      return { hasBalance: false, convertedToUnpaidDays: requestedDays };
    }

    const approvedLeaves = await this.leaveRequestModel.find({
      employeeId,
      leaveTypeId,
      status: LeaveStatus.APPROVED,
    });

    const usedDays = approvedLeaves.reduce(
      (sum, leave) => sum + ((leave as any).totalWorkingDays ?? (leave as any).totalDays),
      0,
    );

    const adjustments = await this.leaveAdjustmentModel.find({
      employeeId,
      leaveTypeId,
    });

    const adjustmentTotal = adjustments.reduce((sum, adj) => sum + (adj as any).change, 0);
    const availableBalance = (entitlement as any).entitlementDays + adjustmentTotal - usedDays;

    if (requestedDays <= availableBalance) {
      return { hasBalance: true, convertedToUnpaidDays: 0 };
    }

    const excessDays = requestedDays - availableBalance;
    return { hasBalance: false, convertedToUnpaidDays: excessDays };
  }

  // ======================================================
  // ACCRUAL & CARRY-OVER (unchanged placeholder)
  // ======================================================

  async processAccrual(employeeId?: Types.ObjectId) {
    // You can reuse your existing implementation, or keep this placeholder
    // Implementation was in earlier version; keep it or paste the one you prefer.
    return;
  }

  async processCarryOver(year?: number) {
    // Placeholder for your carry-over implementation
    return;
  }

  // ======================================================
  // DELEGATION & APPROVAL (unchanged helpers)
  // ======================================================

  async createDelegation(managerId: Types.ObjectId, dto: any) {
    const delegation = new this.managerDelegationModel({
      managerId,
      delegateId: dto.delegateId,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: true,
      departmentIds: dto.departmentIds || [],
      leaveTypeIds: dto.leaveTypeIds || [],
      reason: dto.reason,
      createdBy: managerId,
    });

    return delegation.save();
  }

  async getActiveDelegations(managerId: Types.ObjectId) {
    const now = new Date();
    return this.managerDelegationModel.find({
      managerId,
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null },
      ],
    });
  }

  async getEffectiveManager(
    managerId: Types.ObjectId,
    employee: EmployeeProfileDocument,
    leaveTypeId: Types.ObjectId,
  ): Promise<Types.ObjectId> {
    const now = new Date();
    const delegation = await this.managerDelegationModel.findOne({
      managerId,
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null },
      ],
      $and: [
        {
          $or: [
            { departmentIds: { $in: [(employee as any).primaryDepartmentId] } },
            { departmentIds: { $size: 0 } },
          ],
        },
        {
          $or: [
            { leaveTypeIds: { $in: [leaveTypeId] } },
            { leaveTypeIds: { $size: 0 } },
          ],
        },
      ],
    });

    if (delegation) {
      return (delegation as any).delegateId;
    }

    return managerId;
  }

  async getApprovalConfig(
    employee: EmployeeProfileDocument,
    leaveType: LeaveTypeDocument,
  ): Promise<ApprovalConfigDocument | null> {
    let config = await this.approvalConfigModel.findOne({
      leaveTypeId: (leaveType as any)._id,
      isActive: true,
    });

    if (!config && (employee as any).primaryDepartmentId) {
      config = await this.approvalConfigModel.findOne({
        departmentId: (employee as any).primaryDepartmentId,
        isActive: true,
      });
    }

    if (!config) {
      config = await this.approvalConfigModel.findOne({
        code: 'STANDARD',
        isActive: true,
      });
    }

    return config;
  }

  async buildApprovalFlow(
    config: ApprovalConfigDocument | null,
    employee: EmployeeProfileDocument,
  ): Promise<any[]> {
    if (!config || !(config as any).levels || (config as any).levels.length === 0) {
      return [
        { role: 'MANAGER', status: 'PENDING', level: 1 },
        { role: 'HR', status: 'PENDING', level: 2 },
      ];
    }

    const flow: any[] = [];

    for (const level of (config as any).levels.sort((a: any, b: any) => a.level - b.level)) {
      let approverId: Types.ObjectId | undefined;

      switch (level.type) {
        case 'MANAGER':
          approverId = (employee as any).supervisorPositionId
            ? await this.getPositionEmployeeId((employee as any).supervisorPositionId)
            : undefined;
          break;
        case 'DEPARTMENT_HEAD':
          approverId = (employee as any).primaryDepartmentId
            ? await this.getDepartmentHeadId((employee as any).primaryDepartmentId)
            : undefined;
          break;
        case 'CUSTOM':
          approverId = level.employeeId || level.positionId
            ? await this.getPositionEmployeeId(level.positionId!)
            : undefined;
          break;
        case 'HR':
          break;
      }

      flow.push({
        role: level.type,
        status: 'PENDING',
        level: level.level,
        approverId,
        escalationHours: level.escalationHours,
        isRequired: level.isRequired,
      });
    }

    return flow;
  }

  // ======================================================
  // ESCALATION (unchanged)
  // ======================================================

  async processEscalations() {
    const now = new Date();
    const pendingRequests = await this.leaveRequestModel.find({
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.UNDER_REVIEW] },
    });

    for (const request of pendingRequests) {
      const pendingStep = (request as any).approvalFlow.find(
        (s: any) => s.status === 'PENDING',
      );

      if (!pendingStep) continue;

      const escalationHours = pendingStep.escalationHours || 24;
      const lastCheck = (request as any).meta?.lastEscalationCheck
        ? new Date((request as any).meta.lastEscalationCheck)
        : (request as any).createdAt;

      const hoursSinceCheck = (now.getTime() - (lastCheck ? lastCheck.getTime() : 0)) / (1000 * 60 * 60);

      if (hoursSinceCheck >= escalationHours) {
        await this.escalateRequest((request as any)._id, pendingStep);
      }
    }
  }

  async escalateRequest(
    requestId: Types.ObjectId,
    pendingStep: any,
  ) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) return;

    const oldState = request.toObject();

    const currentLevel = pendingStep.level || 1;
    const nextStep = (request as any).approvalFlow.find(
      (s: any) => s.level > currentLevel && s.isRequired !== false,
    );

    if (nextStep) {
      pendingStep.status = 'ESCALATED';
      nextStep.status = 'PENDING';
      (request as any).meta = {
        ...(request as any).meta,
        escalationLevel: ((request as any).meta?.escalationLevel || 0) + 1,
        lastEscalationCheck: new Date(),
      };

      await this.createAuditLog(
        (request as any)._id,
        AuditAction.AUTO_ESCALATED,
        undefined,
        oldState,
        request.toObject(),
        `Auto-escalated from level ${currentLevel} to level ${nextStep.level}`,
        undefined,
        nextStep.level,
      );
    } else {
      const hrStep = (request as any).approvalFlow.find((s: any) => s.role === 'HR');
      if (hrStep && hrStep.status === 'PENDING') {
        pendingStep.status = 'ESCALATED';
        (request as any).meta = {
          ...(request as any).meta,
          escalationLevel: ((request as any).meta?.escalationLevel || 0) + 1,
          lastEscalationCheck: new Date(),
        };

        await this.createAuditLog(
          (request as any)._id,
          AuditAction.AUTO_ESCALATED,
          undefined,
          oldState,
          request.toObject(),
          `Auto-escalated to HR`,
          undefined,
          hrStep.level || 999,
        );
      }
    }

    await request.save();
  }

  // ======================================================
  // AUDIT TRAIL / TIMELINE
  // ======================================================

  async createAuditLog(
    leaveRequestId: Types.ObjectId | undefined,
    action: AuditAction,
    performedBy?: Types.ObjectId,
    oldState?: Record<string, any>,
    newState?: Record<string, any>,
    comment?: string,
    delegateId?: Types.ObjectId,
    escalationLevel?: number,
  ) {
    const auditLog = new this.leaveAuditLogModel({
      leaveRequestId,
      action,
      performedBy,
      timestamp: new Date(),
      comment,
      oldState,
      newState,
      delegateId,
      escalationLevel,
    });

    return auditLog.save();
  }

  async getRequestTimeline(leaveRequestId: Types.ObjectId | string) {
    const lrId = typeof leaveRequestId === 'string' ? new Types.ObjectId(leaveRequestId) : leaveRequestId;
    return this.leaveAuditLogModel
      .find({ leaveRequestId: lrId })
      .populate('performedBy', 'name email')
      .populate('delegateId', 'employeeNumber')
      .sort({ timestamp: -1 })
      .lean();
  }

  async getAuditLogs(filters?: {
    leaveRequestId?: string;
    action?: AuditAction;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query: any = {};

    if (filters?.leaveRequestId) {
      query.leaveRequestId = new Types.ObjectId(filters.leaveRequestId);
    }

    if (filters?.action) {
      query.action = filters.action;
    }

    if (filters?.performedBy) {
      query.performedBy = new Types.ObjectId(filters.performedBy);
    }

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    return this.leaveAuditLogModel
      .find(query)
      .populate('leaveRequestId', 'employeeId leaveTypeId startDate endDate')
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .lean();
  }

  // ======================================================
  // HELPER METHODS FOR APPROVAL
  // ======================================================

  private async canApproveStep(
    approverId: Types.ObjectId,
    step: any,
    employee: EmployeeProfileDocument,
  ): Promise<boolean> {
    if (step.approverId) {
      return (step.approverId as Types.ObjectId).equals(approverId);
    }

    if (step.role === 'MANAGER') {
      if ((employee as any).supervisorPositionId) {
        const supervisorId = await this.getPositionEmployeeId((employee as any).supervisorPositionId);
        return supervisorId ? supervisorId.equals(approverId) : false;
      }
      return false;
    }

    return true;
  }

  private async getPositionEmployeeId(
    positionId: Types.ObjectId,
  ): Promise<Types.ObjectId | undefined> {
    const employee = await this.employeeProfileModel.findOne({
      primaryPositionId: positionId,
      status: 'ACTIVE',
    });

    return employee?._id;
  }

  private async getDepartmentHeadId(
    departmentId: Types.ObjectId,
  ): Promise<Types.ObjectId | undefined> {
    return undefined;
  }

  // ======================================================
  // ----------------- MISSING HR METHODS ADDED -----------------
  // ======================================================

  // 1) HR finalize
  async hrFinalize(hrId: Types.ObjectId, requestId: string, dto: { approved: boolean; reason?: string }) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    const oldState = request.toObject();

    (request as any).status = dto.approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    (request as any).decisionReason = dto.reason || (dto.approved ? 'Approved by HR' : 'Rejected by HR');

    const saved = await request.save();

    await this.createAuditLog(
      (request as any)._id,
      dto.approved ? AuditAction.APPROVED : AuditAction.REJECTED,
      hrId,
      oldState,
      saved.toObject(),
      dto.reason,
    );

    return saved;
  }

  // 2) HR override
  async hrOverrideDecision(hrId: Types.ObjectId, requestId: string, dto: { approved: boolean; reason?: string }) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    const oldState = request.toObject();

    (request as any).status = dto.approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    (request as any).overriddenBy = hrId;
    (request as any).decisionReason = dto.reason || 'HR override applied';

    const saved = await request.save();

    await this.createAuditLog(
      (request as any)._id,
      AuditAction.OVERRIDDEN,
      hrId,
      oldState,
      saved.toObject(),
      dto.reason,
    );

    return saved;
  }

  // 3) manualAdjustment (improved)
  async manualAdjustment(hrId: Types.ObjectId, dto: any) {
    const employeeId = new Types.ObjectId(dto.employeeId);
    const leaveTypeId = new Types.ObjectId(dto.leaveTypeId);

    // Get current balance before adjustment
    const currentBalance = await this.getEmployeeBalance(employeeId);
    const currentLeaveTypeBalance = (currentBalance || []).find(
      (b: any) => b.leaveTypeId === leaveTypeId.toString(),
    );

    const oldBalance = currentLeaveTypeBalance?.remaining || 0;

    // Create the adjustment
    const adj = new this.leaveAdjustmentModel({
      employeeId,
      leaveTypeId,
      change: dto.change,
      reason: dto.reason,
      adjustedBy: hrId,
      effectiveDate: dto.effectiveDate ?? new Date(),
      meta: {
        adjustmentType: dto.adjustmentType || 'MANUAL',
        previousBalance: oldBalance,
      },
    });

    const savedAdjustment = await adj.save();

    // Recalculate new balance
    const newBalanceArr = await this.getEmployeeBalance(employeeId);
    const newLeaveTypeBalance = (newBalanceArr || []).find(
      (b: any) => b.leaveTypeId === leaveTypeId.toString(),
    );

    const updatedBalance = newLeaveTypeBalance?.remaining || 0;

    // Create audit log for the adjustment
    await this.createAuditLog(
      undefined,
      AuditAction.ADJUSTED,
      hrId,
      {
        employeeId: employeeId.toString(),
        leaveTypeId: leaveTypeId.toString(),
        balance: oldBalance,
        adjustment: null,
      },
      {
        employeeId: employeeId.toString(),
        leaveTypeId: leaveTypeId.toString(),
        balance: updatedBalance,
        adjustment: {
          id: (savedAdjustment as any)._id.toString(),
          change: dto.change,
          reason: dto.reason,
          effectiveDate: (savedAdjustment as any).effectiveDate,
        },
      },
      dto.reason,
    );

    return savedAdjustment;
  }

  // 4) configureLeaveType
  async configureLeaveType(dto: any) {
    if (dto.id) {
      return this.leaveTypeModel.findByIdAndUpdate(dto.id, dto, { new: true });
    }
    return this.leaveTypeModel.create(dto);
  }

  // 5) configureEntitlement
  async configureEntitlement(dto: any) {
    const existing = await this.leaveEntitlementModel.findOne({
      employeeId: dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
    });

    if (existing) {
      (existing as any).entitlementDays = dto.entitlementDays;
      (existing as any).carryOverMax = dto.carryOverMax ?? (existing as any).carryOverMax;
      (existing as any).expiryMonths = dto.expiryMonths ?? (existing as any).expiryMonths;
      return existing.save();
    }

    return this.leaveEntitlementModel.create(dto);
  }

  // 6) configureApprovalFlow
  async configureApprovalFlow(dto: any) {
    if (dto.id) {
      return this.approvalConfigModel.findByIdAndUpdate(dto.id, dto, { new: true });
    }
    return this.approvalConfigModel.create(dto);
  }

  // 7) HR Overview (controller calls getHrOverview)
  async getHrOverview(filters?: any) {
    const query: any = {};

    if (filters?.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
    if (filters?.leaveTypeId) query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    if (filters?.status) query.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      query.startDate = {};
      if (filters?.startDate) query.startDate.$gte = new Date(filters.startDate);
      if (filters?.endDate) query.startDate.$lte = new Date(filters.endDate);
    }

    return this.leaveRequestModel.find(query).sort({ createdAt: -1 }).lean();
  }

  // 8) Irregular leave patterns (controller calls getIrregularLeavePatterns)
  async getIrregularLeavePatterns(employeeId?: string) {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setFullYear(now.getFullYear() - 1);

    const query: any = {
      startDate: { $gte: windowStart },
      status: LeaveStatus.APPROVED,
    };

    if (employeeId) {
      query.employeeId = new Types.ObjectId(employeeId);
    }

    const leaves = await this.leaveRequestModel.find(query).lean();

    const stats: any = {};

    for (const l of leaves) {
      const emp = (l as any).employeeId.toString();
      stats[emp] = stats[emp] || { employeeId: emp, short: 0, monFri: 0, total: 0 };

      const start = new Date((l as any).startDate);
      const dow = start.getDay();

      if (((l as any).totalWorkingDays ?? (l as any).totalDays) <= 1) stats[emp].short++;
      if (dow === 1 || dow === 5) stats[emp].monFri++;

      stats[emp].total++;
    }

    return Object.values(stats).sort((a: any, b: any) => (b.short * 2 + b.monFri) - (a.short * 2 + a.monFri));
  }

  // ======================================================
  // ----------------- END MISSING HR METHODS -----------------
  // ======================================================

  // Helper: months diff
  private calculateMonthsDifference(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months + (date2.getMonth() - date1.getMonth());
  }
}
