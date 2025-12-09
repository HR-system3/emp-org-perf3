import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { LeavesService } from '../leaves.service';
import { LeavesSchedulerService } from '../leaves-scheduler.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

import { ApproveRejectLeaveDto } from '../dto/approve-reject-leave.dto';
import { ConfigureLeaveTypeDto } from '../dto/configure-leave-type.dto';
import { ConfigureEntitlementDto } from '../dto/configure-entitlement.dto';
import { ManualAdjustmentDto } from '../dto/manual-adjustment.dto';

@Controller('leaves/hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HR)
export class HrLeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly schedulerService: LeavesSchedulerService,
  ) {}

  // ======================================================
  // HR DECISIONS
  // ======================================================

  @Post('requests/:id/finalize')
  async finalize(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    return this.leavesService.hrFinalize(req.user.userId, id, dto);
  }

  @Post('requests/:id/override')
  async overrideDecision(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    return this.leavesService.hrOverrideDecision(req.user.userId, id, dto);
  }

  // ======================================================
  // ADJUSTMENTS
  // ======================================================

  @Post('adjustments')
  async manualAdjustment(@Req() req, @Body() dto: ManualAdjustmentDto) {
    return this.leavesService.manualAdjustment(req.user.userId, dto);
  }

  // ======================================================
  // CONFIGURATIONS
  // ======================================================

  @Post('types')
  async configureLeaveType(@Body() dto: ConfigureLeaveTypeDto) {
    return this.leavesService.configureLeaveType(dto);
  }

  @Post('entitlements')
  async configureEntitlement(@Body() dto: ConfigureEntitlementDto) {
    return this.leavesService.configureEntitlement(dto);
  }

  @Post('approval-configs')
  async configureApprovalFlow(@Body() dto: any) {
    return this.leavesService.configureApprovalFlow(dto);
  }

  // ======================================================
  // SCHEDULERS (MANUAL TRIGGERS)
  // ======================================================

  @Post('scheduler/accrual')
  async triggerAccrual(@Body() body?: { employeeId?: string }) {
    return this.schedulerService.triggerAccrual(body?.employeeId);
  }

  @Post('scheduler/carry-over')
  async triggerCarryOver(@Body() body?: { year?: number }) {
    return this.schedulerService.triggerCarryOver(body?.year);
  }

  @Post('scheduler/escalations')
  async triggerEscalations() {
    return this.schedulerService.triggerEscalations();
  }

  // ======================================================
  // AUDIT LOGS
  // ======================================================

  @Get('audit-logs')
  async getAuditLogs(
    @Query('leaveRequestId') leaveRequestId?: string,
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leavesService.getAuditLogs({
      leaveRequestId,
      action: action as any,
      performedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }

  // ======================================================
  // 📌 NEW — HR OVERVIEW (REQUIRED IN PDF)
  // ======================================================

  @Get('requests')
  async getAllRequests(
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leavesService.getHrOverview({
      employeeId,
      leaveTypeId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // ======================================================
  // 📌 NEW — IRREGULAR LEAVE PATTERN REPORT
  // ======================================================

  @Get('reports/patterns')
  async getIrregularPatterns(
    @Query('employeeId') employeeId?: string,
  ) {
    return this.leavesService.getIrregularLeavePatterns(employeeId);
  }

  // ======================================================
  // CALENDAR & HOLIDAY MANAGEMENT
  // ======================================================

  @Post('calendars')
  async createCalendar(@Body() dto: any) {
    return this.leavesService.createCalendar(dto);
  }

  @Get('calendars')
  async getCalendars(
    @Query('country') country?: string,
    @Query('year') year?: number,
  ) {
    return this.leavesService.getCalendars({
      country,
      year: year ? Number(year) : undefined,
    });
  }

  @Get('calendars/:id')
  async getCalendar(@Param('id') id: string) {
    return this.leavesService.getCalendar(id);
  }

  @Post('calendars/:id')
  async updateCalendar(@Param('id') id: string, @Body() dto: any) {
    return this.leavesService.updateCalendar(id, dto);
  }

  @Post('calendars/:id/delete')
  async deleteCalendar(@Param('id') id: string) {
    return this.leavesService.deleteCalendar(id);
  }

  @Post('calendars/:id/holidays')
  async addHoliday(@Param('id') id: string, @Body() holiday: any) {
    return this.leavesService.addHoliday(id, {
      name: holiday.name,
      date: new Date(holiday.date),
      recurring: holiday.recurring,
    });
  }

  @Post('calendars/:id/holidays/remove')
  async removeHoliday(@Param('id') id: string, @Body() body: { date: string }) {
    return this.leavesService.removeHoliday(id, new Date(body.date));
  }

  @Post('calendars/:id/blocked-periods')
  async addBlockedPeriod(@Param('id') id: string, @Body() blockedPeriod: any) {
    return this.leavesService.addBlockedPeriod(id, {
      start: new Date(blockedPeriod.start),
      end: new Date(blockedPeriod.end),
      reason: blockedPeriod.reason,
    });
  }

  @Post('calendars/:id/blocked-periods/remove')
  async removeBlockedPeriod(
    @Param('id') id: string,
    @Body() body: { start: string; end: string },
  ) {
    return this.leavesService.removeBlockedPeriod(
      id,
      new Date(body.start),
      new Date(body.end),
    );
  }
}
