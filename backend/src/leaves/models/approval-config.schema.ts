import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type ApprovalConfigDocument = HydratedDocument<ApprovalConfig>;

export enum ApprovalLevelType {
  MANAGER = 'MANAGER',
  HR = 'HR',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  CUSTOM = 'CUSTOM',
}

// ApprovalLevel is an embedded document, not a separate schema
export class ApprovalLevel {
  level: number; // 1, 2, 3, etc.

  type: ApprovalLevelType;

  positionId?: Types.ObjectId; // For CUSTOM type

  departmentId?: Types.ObjectId; // For DEPARTMENT_HEAD type

  employeeId?: Types.ObjectId; // For specific employee approver

  isRequired?: boolean; // If false, can be skipped if not available

  escalationHours?: number; // Hours before auto-escalation
}

@Schema({ timestamps: true })
export class ApprovalConfig {
  @Prop({ required: true, unique: true })
  code: string; // e.g., 'STANDARD', 'SENIOR', 'EXECUTIVE'

  @Prop({ required: true })
  name: string;

  @Prop({ type: Array, default: [] })
  levels: ApprovalLevel[];

  @Prop({ type: Types.ObjectId, ref: 'LeaveType' })
  leaveTypeId?: Types.ObjectId; // If specific to leave type

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId; // If specific to department

  @Prop({ default: true })
  allowHrOverride: boolean;

  @Prop({ default: true })
  isActive: boolean;

 @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
 meta?: Record<string, any>;

}

export const ApprovalConfigSchema = SchemaFactory.createForClass(ApprovalConfig);

// Indexes
ApprovalConfigSchema.index({ code: 1, isActive: 1 });
ApprovalConfigSchema.index({ leaveTypeId: 1, isActive: 1 });
ApprovalConfigSchema.index({ departmentId: 1, isActive: 1 });

