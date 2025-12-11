import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { ConfigStatus, Applicability } from '../enums/payroll-configuration-enums';

export type DeductionDocument = HydratedDocument<Deduction>;

export enum DeductionType {
  TAX = 'Tax',
  INSURANCE = 'Insurance',
  UNPAID_LEAVE = 'Unpaid Leave',
  PENALTY = 'Penalty',
  LOAN = 'Loan',
  ADVANCE = 'Advance',
  OTHER = 'Other',
}

@Schema({ timestamps: true })
export class Deduction {
  @Prop({ required: true, unique: true })
  name: string; // e.g., "Income Tax", "Social Insurance", "Late Arrival Penalty"

  @Prop()
  description?: string;

  @Prop({ required: true, type: String, enum: DeductionType })
  deductionType: DeductionType;

  @Prop({ required: true, min: 0, max: 100 })
  percentage: number; // Percentage of salary (0-100)

  @Prop({ required: true, min: 0 })
  fixedAmount: number; // Fixed amount deduction

  @Prop({ required: true })
  isPercentage: boolean; // true if percentage-based, false if fixed amount

  @Prop({ min: 0 })
  minAmount?: number; // Minimum deduction amount

  @Prop({ min: 0 })
  maxAmount?: number; // Maximum deduction amount

  @Prop({ required: true, type: String, enum: Applicability })
  applicability: Applicability; // Which employee types this applies to

  @Prop({ type: [String] })
  employeeRoles?: string[]; // Specific roles if applicable (optional)

  @Prop({ required: true, type: String, enum: ConfigStatus, default: ConfigStatus.DRAFT })
  status: ConfigStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  createdBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  updatedBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  approvedBy?: mongoose.Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ default: false })
  isDeleted?: boolean; // Soft delete flag
}

export const DeductionSchema = SchemaFactory.createForClass(Deduction);

