import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type LeaveAuditLogDocument = HydratedDocument<LeaveAuditLog>;

export enum AuditAction {
  SUBMITTED = 'SUBMITTED',
  EDITED = 'EDITED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  FINALIZED = 'FINALIZED',
  OVERRIDDEN = 'OVERRIDDEN',
  ADJUSTED = 'ADJUSTED',
  DELEGATED = 'DELEGATED',
  CANCELLED = 'CANCELLED',
  AUTO_ESCALATED = 'AUTO_ESCALATED',
}

@Schema({ timestamps: true })
export class LeaveAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', required: false })
  leaveRequestId?: Types.ObjectId; // Optional for manual adjustments

  @Prop({ enum: Object.values(AuditAction), required: true })
  action: AuditAction;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy?: Types.ObjectId; // null for system actions

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  comment?: string;

  @Prop({ type: Object })
  oldState?: Record<string, any>; // Previous state snapshot

  @Prop({ type: Object })
  newState?: Record<string, any>; // New state snapshot

  @Prop()
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  delegateId?: Types.ObjectId; // If action was delegated

  @Prop()
  escalationLevel?: number; // For escalation tracking

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const LeaveAuditLogSchema = SchemaFactory.createForClass(LeaveAuditLog);

// Indexes for efficient queries
LeaveAuditLogSchema.index({ leaveRequestId: 1, timestamp: -1 });
LeaveAuditLogSchema.index({ performedBy: 1, timestamp: -1 });
LeaveAuditLogSchema.index({ action: 1, timestamp: -1 });

