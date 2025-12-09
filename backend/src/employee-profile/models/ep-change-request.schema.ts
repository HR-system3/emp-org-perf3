// ./src/employee-profile/models/ep-change-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';
import { EmployeeProfile } from './employee-profile.schema';

export type EmployeeProfileChangeRequestDocument =
  HydratedDocument<EmployeeProfileChangeRequest>;

@Schema({ collection: 'employee_profile_change_requests', timestamps: true })
export class EmployeeProfileChangeRequest {
  @Prop({ type: String, required: true, unique: true })
  requestId: string;

  @Prop({ type: Types.ObjectId, ref: EmployeeProfile.name, required: true })
  employeeProfileId: Types.ObjectId;

  /**
   * Human-readable description for HR (e.g. "Change department to Marketing").
   */
  @Prop({ type: String, required: true })
  requestDescription: string;

  /**
   * Optional structured payload with the requested field changes.
   * Example: { primaryDepartmentId: "...", maritalStatus: "MARRIED" }
   */
  @Prop({ type: Object })
  requestedChanges?: Record<string, any>;

  @Prop({ type: String })
  reason?: string;

  @Prop({
    type: String,
    enum: Object.values(ProfileChangeStatus),
    default: ProfileChangeStatus.PENDING,
  })
  status: ProfileChangeStatus;

  @Prop({ type: Date, default: () => new Date() })
  submittedAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;
}

export const EmployeeProfileChangeRequestSchema = SchemaFactory.createForClass(
  EmployeeProfileChangeRequest,
);
