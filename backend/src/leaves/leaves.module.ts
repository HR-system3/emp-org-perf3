import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesSchedulerService } from './leaves-scheduler.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementSchema } from './models/leave-entitlement.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema} from './models/calendar.schema';
import { Attachment,AttachmentSchema } from './models/attachment.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { ManagerDelegation, ManagerDelegationSchema } from './models/manager-delegation.schema';
import { LeaveAuditLog, LeaveAuditLogSchema } from './models/leave-audit-log.schema';
import { ApprovalConfig, ApprovalConfigSchema } from './models/approval-config.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[MongooseModule.forFeature([
    {name:LeaveType.name,schema:LeaveTypeSchema},
    {name:LeaveRequest.name, schema: LeaveRequestSchema},
    {name:LeavePolicy.name, schema:LeavePolicySchema},
    {name:LeaveEntitlement.name, schema:LeaveEntitlementSchema},
    {name: LeaveCategory.name, schema:LeaveCategorySchema},
    {name: LeaveAdjustment.name, schema:LeaveAdjustmentSchema},
    {name:Calendar.name, schema:CalendarSchema},
    {name:Attachment.name, schema: AttachmentSchema},
    {name:EmployeeProfile.name, schema:EmployeeProfileSchema},
    {name:ManagerDelegation.name, schema:ManagerDelegationSchema},
    {name:LeaveAuditLog.name, schema:LeaveAuditLogSchema},
    {name:ApprovalConfig.name, schema:ApprovalConfigSchema}
  ]),EmployeeProfileModule,TimeManagementModule,AuthModule],
  providers: [LeavesService, LeavesSchedulerService],
  exports:[LeavesService]
})
export class LeavesModule {}
