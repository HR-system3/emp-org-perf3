import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ManagerDelegationDocument = HydratedDocument<ManagerDelegation>;

@Schema({ timestamps: true })
export class ManagerDelegation {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  managerId: Types.ObjectId; // The manager who is delegating

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegateId: Types.ObjectId; // The delegate who will handle approvals

  @Prop({ required: true })
  startDate: Date; // When delegation starts

  @Prop()
  endDate?: Date; // When delegation ends (null = indefinite)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Department', default: [] })
  departmentIds?: Types.ObjectId[]; // Specific departments (empty = all)

  @Prop({ type: [Types.ObjectId], ref: 'LeaveType', default: [] })
  leaveTypeIds?: Types.ObjectId[]; // Specific leave types (empty = all)

  @Prop()
  reason?: string; // Reason for delegation

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;
}

export const ManagerDelegationSchema = SchemaFactory.createForClass(ManagerDelegation);

// Index for efficient queries
ManagerDelegationSchema.index({ managerId: 1, isActive: 1 });
ManagerDelegationSchema.index({ delegateId: 1, isActive: 1 });
ManagerDelegationSchema.index({ startDate: 1, endDate: 1 });

