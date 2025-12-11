import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { DisputeStatus } from '../enums/payroll-tracking-enum';

export type DisputeDocument = HydratedDocument<Dispute>;

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ required: true, unique: true })
  disputeId: string; // DISP-0001

  @Prop({ required: true })
  description: string;

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'paySlip',
    required: true,
  })
  payslipId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: DisputeStatus,
    default: DisputeStatus.UNDER_REVIEW,
  })
  status: DisputeStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  resolutionComment?: string;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
