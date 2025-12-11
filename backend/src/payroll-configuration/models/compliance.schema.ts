import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export type ComplianceDocument = HydratedDocument<Compliance>;

@Schema({ timestamps: true })
export class TaxBracket {
  @Prop({ required: true, min: 0 })
  minSalary: number;

  @Prop({ required: true, min: 0 })
  maxSalary: number; // Use Infinity or very large number for highest bracket

  @Prop({ required: true, min: 0, max: 25 })
  taxRate: number; // Tax rate in percentage (max 25% as per requirement)
}

const TaxBracketSchema = SchemaFactory.createForClass(TaxBracket);

@Schema({ timestamps: true })
export class InsuranceBracket {
  @Prop({ required: true, min: 0 })
  minSalary: number;

  @Prop({ required: true, min: 0 })
  maxSalary: number;

  @Prop({ required: true, min: 0, max: 14 })
  employeeRate: number; // Employee contribution rate (max 14%)

  @Prop({ required: true, min: 0, max: 14 })
  employerRate: number; // Employer contribution rate (max 14%)
}

const InsuranceBracketSchema = SchemaFactory.createForClass(InsuranceBracket);

@Schema({ timestamps: true })
export class Compliance {
  @Prop({ required: true, unique: true })
  name: string; // e.g., "Egypt Tax Compliance 2024", "Social Insurance Compliance"

  @Prop()
  description?: string;

  @Prop({ required: true })
  country: string; // e.g., "Egypt"

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop()
  expiryDate?: Date;

  // Tax Configuration
  @Prop({ type: [TaxBracketSchema], default: [] })
  taxBrackets: TaxBracket[];

  @Prop({ min: 0, max: 25 })
  maxTaxRate?: number; // Maximum tax rate allowed (25%)

  // Insurance Configuration
  @Prop({ type: [InsuranceBracketSchema], default: [] })
  insuranceBrackets: InsuranceBracket[];

  @Prop({ min: 0, max: 14 })
  maxInsuranceRate?: number; // Maximum insurance rate allowed (14%)

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

export const ComplianceSchema = SchemaFactory.createForClass(Compliance);

