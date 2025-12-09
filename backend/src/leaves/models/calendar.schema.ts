import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument } from 'mongoose';

export type CalendarDocument = HydratedDocument<Calendar>;

export type Holiday = {
  name: string;
  date: Date;
  recurring?: boolean;
};

@Schema({ timestamps: true })
export class Calendar {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  year: number;

  @Prop({ type: Array, default: [] })
  holidays: Holiday[];

  @Prop({ type: Array, default: [] })
  blockedPeriods: { start: Date; end: Date; reason?: string }[];
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
