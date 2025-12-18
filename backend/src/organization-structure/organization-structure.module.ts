import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationStructureController } from './organization-structure.controller';
import { OrganizationStructureService } from './organization-structure.service';
import { Department, DepartmentSchema } from './models/department.schema';
import { Position, PositionSchema } from './models/position.schema';
import {
  PositionAssignment,
  PositionAssignmentSchema,
} from './models/position-assignment.schema';
import {
  StructureApproval,
  StructureApprovalSchema,
} from './models/structure-approval.schema';
import {
  StructureChangeLog,
  StructureChangeLogSchema,
} from './models/structure-change-log.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestSchema,
} from './models/structure-change-request.schema';
import { PayrollStub, EmployeeProfileStub } from './utils/integration-stubs';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from '../employee-profile/models/employee-system-role.schema';
import { User, UserSchema } from '../users/models/user.schema';
import { OrganizationNotificationService } from './notifications/organization-notification.service';
import {
  InAppNotification,
  InAppNotificationSchema,
} from './models/in-app-notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: PositionAssignment.name, schema: PositionAssignmentSchema },
      { name: StructureApproval.name, schema: StructureApprovalSchema },
      { name: StructureChangeLog.name, schema: StructureChangeLogSchema },
      {
        name: StructureChangeRequest.name,
        schema: StructureChangeRequestSchema,
      },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: User.name, schema: UserSchema },
      { name: InAppNotification.name, schema: InAppNotificationSchema },
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService, OrganizationNotificationService, PayrollStub, EmployeeProfileStub],
  exports: [OrganizationStructureService],
})
export class OrganizationStructureModule {}
