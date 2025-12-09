import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type LeaveEntitlementDocument = HydratedDocument<LeaveEntitlement>;

@Schema({ timestamps: true })
export class LeaveEntitlement {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: false })
  employeeId?: Types.ObjectId; // if personalized

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  entitlementDays: number;

  @Prop({ default: null })
  accrualRatePerMonth?: number;

  @Prop({ default: null })
  carryOverMax?: number;

  @Prop({ default: null })
  expiryMonths?: number; // months after which carried days expire

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const LeaveEntitlementSchema = SchemaFactory.createForClass(LeaveEntitlement);
