import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Position } from './position.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ collection: 'departments', timestamps: true })
export class Department {
  @Prop({ type: String, required: true, unique: true })
  deptId: string; // BR-5: Unique ID for entities

  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  headPositionId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  costCenter: string; // BR-30: Required for creation

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
