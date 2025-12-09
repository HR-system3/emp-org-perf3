import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttachmentType } from './attachment.schema';

export type LeaveTypeDocument = HydratedDocument<LeaveType>;

@Schema({ timestamps: true })
export class LeaveType {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'LeaveCategory', required: true })
  category: Types.ObjectId;

  @Prop({ default: false })
  isPaid?: boolean;

  @Prop({ default: false })
  requiresAttachment?: boolean;

  @Prop({ enum: Object.values(AttachmentType), required: false })
  attachmentType?: AttachmentType;

  @Prop({ default: null })
  minTenureMonths?: number;

  @Prop({ default: null })
  maxDurationDays?: number;

  @Prop({ default: false })
  allowPostLeaveSubmission?: boolean;

  @Prop({ default: false })
  pauseAccrual?: boolean; // e.g., maternity may pause accrual

  @Prop({ default: '' })
  payrollPayCode?: string; // linkage to payroll

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>; // For accrual frequency and other config
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);
