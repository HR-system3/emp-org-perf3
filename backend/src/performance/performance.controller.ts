import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import {
  CreateAppraisalTemplateDto,
  UpdateAppraisalTemplateDto,
} from './dto/appraisal-template.dto';
import {
  CreateAppraisalCycleDto,
  UpdateAppraisalCycleDto,
} from './dto/appraisal-cycle.dto';
import { BulkAssignAppraisalsDto } from './dto/appraisal-assignment.dto';
import {
  AcknowledgeAppraisalRecordDto,
  CreateAppraisalRecordDto,
  CreateDisputeDto,
  PublishAppraisalRecordDto,
  ResolveDisputeDto,
  UpdateAppraisalRecordDto,
} from './dto/appraisal-record-dispute.dto';
import {
  AppraisalAssignmentStatus,
  AppraisalDisputeStatus,
} from './enums/performance.enums';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ---------- Templates ----------

  @Post('templates')
  createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  @Get('templates')
  getTemplates() {
    return this.performanceService.findAllTemplates();
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string) {
    return this.performanceService.findTemplateById(id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, dto);
  }

  // ---------- Cycles ----------

  @Post('cycles')
  createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  getCycles(@Query('status') status?: string) {
    return this.performanceService.findAllCycles(status);
  }

  @Get('cycles/:id')
  getCycle(@Param('id') id: string) {
    return this.performanceService.findCycleById(id);
  }

  @Patch('cycles/:id')
  updateCycle(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(id, dto);
  }

  @Get('cycles/:id/progress')
  getCycleProgress(@Param('id') id: string) {
    return this.performanceService.getCycleProgress(id);
  }

  // ---------- Assignments ----------

  @Post('assignments/bulk')
  bulkAssign(@Body() dto: BulkAssignAppraisalsDto) {
    return this.performanceService.bulkAssign(dto);
  }

  @Get('assignments')
  getAssignments(
    @Query('cycleId') cycleId?: string,
    @Query('managerProfileId') managerProfileId?: string,
    @Query('employeeProfileId') employeeProfileId?: string,
    @Query('status') status?: AppraisalAssignmentStatus,
  ) {
    return this.performanceService.getAssignments({
      cycleId,
      managerProfileId,
      employeeProfileId,
      status,
    });
  }

  // ---------- Records ----------

  @Post('records')
  createRecord(@Body() dto: CreateAppraisalRecordDto) {
    return this.performanceService.createRecord(dto);
  }

  @Get('records/:id')
  getRecord(@Param('id') id: string) {
    return this.performanceService.findRecordById(id);
  }

  @Patch('records/:id')
  updateRecord(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalRecordDto,
  ) {
    return this.performanceService.updateRecord(id, dto);
  }

  @Patch('records/:id/submit-manager')
  submitByManager(@Param('id') id: string) {
    return this.performanceService.submitByManager(id);
  }

  @Patch('records/:id/publish')
  publishRecord(
    @Param('id') id: string,
    @Body() dto: PublishAppraisalRecordDto,
  ) {
    return this.performanceService.publishRecord(id, dto);
  }

  @Patch('records/:id/acknowledge')
  acknowledgeRecord(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAppraisalRecordDto,
  ) {
    return this.performanceService.acknowledgeRecord(id, dto);
  }

  @Get('records/employee/:employeeId')
  getEmployeeRecords(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeRecords(employeeId);
  }

  // ---------- Disputes ----------

  @Post('disputes')
  createDispute(@Body() dto: CreateDisputeDto) {
    return this.performanceService.createDispute(dto);
  }

  @Get('disputes')
  getDisputes(
    @Query('cycleId') cycleId?: string,
    @Query('employeeProfileId') employeeProfileId?: string,
    @Query('status') status?: AppraisalDisputeStatus,
  ) {
    return this.performanceService.getDisputes({
      cycleId,
      employeeProfileId,
      status,
    });
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.performanceService.resolveDispute(id, dto);
  }
}
