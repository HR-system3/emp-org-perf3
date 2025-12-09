import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type LeaveAdjustmentDocument = HydratedDocument<LeaveAdjustment>;

@Schema({ timestamps: true })
export class LeaveAdjustment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  change: number; // positive or negative

  @Prop({ required: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adjustedBy: Types.ObjectId;

  @Prop()
  effectiveDate?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const LeaveAdjustmentSchema = SchemaFactory.createForClass(LeaveAdjustment);
