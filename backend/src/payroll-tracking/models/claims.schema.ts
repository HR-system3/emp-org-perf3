import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { ClaimStatus } from '../enums/payroll-tracking-enum';

export type ClaimsDocument = HydratedDocument<Claim>;

@Schema({ timestamps: true })
export class Claim {
  @Prop({ required: true, unique: true })
  claimId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  claimType: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Employee.name,
    required: true,
  })
  employeeId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Employee.name,
  })
  financeStaffId?: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop()
  approvedAmount?: number;

  @Prop({
    required: true,
    type: String,
    enum: ClaimStatus,
    default: ClaimStatus.UNDER_REVIEW,
  })
  status: ClaimStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  resolutionComment?: string;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
