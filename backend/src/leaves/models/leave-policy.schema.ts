import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type LeavePolicyDocument = HydratedDocument<LeavePolicy>;

@Schema({ timestamps: true })
export class LeavePolicy {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Array, default: [] })
  rules: {
    key: string;
    value: any;
    description?: string;
  }[];

  @Prop({ default: 'HIRE_DATE' })
  legalYearResetCriteria?: 'HIRE_DATE' | 'FIRST_VACATION_DATE' | 'REVISED_HIRE_DATE' | 'WORK_RECEIVING_DATE';

  @Prop({ default: 'MONTHLY' })
  accrualFrequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

  @Prop({ default: 0 })
  roundingMode?: number; // 0=no, 1=arithmetic, 2=up, 3=down

  @Prop({ default: null })
  maxCarryOver?: number;

  @Prop({ default: null })
  maxCarryOverExpiryMonths?: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
