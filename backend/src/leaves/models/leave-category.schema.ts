import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument } from 'mongoose';

export type LeaveCategoryDocument = HydratedDocument<LeaveCategory>;

@Schema({ timestamps: true })
export class LeaveCategory {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  affectsBalance: boolean; // true if deducted from annual balance

  @Prop()
  description?: string;
}

export const LeaveCategorySchema = SchemaFactory.createForClass(LeaveCategory);
