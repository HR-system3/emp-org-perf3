import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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
import { AuthGuard } from '../auth/guards/authentication.guard';
import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@Controller('performance')
@UseGuards(AuthGuard, authorizationGaurd)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ---------- Templates ----------

  @Post('templates')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  @Get('templates')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  getTemplates() {
    return this.performanceService.findAllTemplates();
  }

  @Get('templates/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  getTemplate(@Param('id') id: string) {
    return this.performanceService.findTemplateById(id);
  }

  @Patch('templates/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, dto);
  }

  // ---------- Cycles ----------

  @Post('cycles')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  getCycles(@Query('status') status?: string) {
    return this.performanceService.findAllCycles(status);
  }

  @Get('cycles/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  getCycle(@Param('id') id: string) {
    return this.performanceService.findCycleById(id);
  }

  @Patch('cycles/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  updateCycle(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(id, dto);
  }

  @Get('cycles/:id/progress')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  getCycleProgress(@Param('id') id: string) {
    return this.performanceService.getCycleProgress(id);
  }

  // ---------- Assignments ----------

  @Post('assignments/bulk')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  bulkAssign(@Body() dto: BulkAssignAppraisalsDto) {
    return this.performanceService.bulkAssign(dto);
  }

  @Get('assignments')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
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
  @Roles(Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  createRecord(@Body() dto: CreateAppraisalRecordDto) {
    return this.performanceService.createRecord(dto);
  }

  @Get('records/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  getRecord(@Param('id') id: string) {
    return this.performanceService.findRecordById(id);
  }

  @Patch('records/:id')
  @Roles(Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  updateRecord(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalRecordDto,
  ) {
    return this.performanceService.updateRecord(id, dto);
  }

  @Patch('records/:id/submit-manager')
  @Roles(Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  submitByManager(@Param('id') id: string) {
    return this.performanceService.submitByManager(id);
  }

  @Patch('records/:id/publish')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  publishRecord(
    @Param('id') id: string,
    @Body() dto: PublishAppraisalRecordDto,
  ) {
    return this.performanceService.publishRecord(id, dto);
  }

  @Patch('records/:id/acknowledge')
  @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  acknowledgeRecord(
    @Param('id') id: string,
    @Body() dto: AcknowledgeAppraisalRecordDto,
  ) {
    return this.performanceService.acknowledgeRecord(id, dto);
  }

  @Get('records/employee/:employeeId')
  @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
  getEmployeeRecords(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeRecords(employeeId);
  }

  // ---------- Disputes ----------

  @Post('disputes')
  @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  createDispute(@Body() dto: CreateDisputeDto) {
    return this.performanceService.createDispute(dto);
  }

  @Get('disputes')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
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
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.performanceService.resolveDispute(id, dto);
  }
}
