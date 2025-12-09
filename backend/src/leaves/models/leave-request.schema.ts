import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';  // <-- add this at top if missing

import { HydratedDocument, Types } from 'mongoose';
import { LeaveStatus } from '../enums/leave-status.enum';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

export class ApprovalRecord {
  role: string;
  status: string;
  level: number;
  approverId?: Types.ObjectId;

  isRequired?: boolean;
  escalationHours?: number;

  decidedBy?: Types.ObjectId;
  decidedAt?: Date;
  comment?: string;
}

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  totalDays: number;

  @Prop()
  totalWorkingDays?: number;

  @Prop()
  justification?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Attachment', default: [] })
  attachments: Types.ObjectId[];

  @Prop({ enum: Object.values(LeaveStatus), default: LeaveStatus.PENDING })
  status: string;

  @Prop({
    type: [
      {
        role: { type: String, required: true },
        status: { type: String, required: true },
        level: { type: Number, required: true },

        approverId: { type: Types.ObjectId, required: false },

        isRequired: { type: Boolean, default: true },
        escalationHours: { type: Number, default: 24 },

        decidedBy: { type: Types.ObjectId, required: false },
        decidedAt: { type: Date, required: false },
        comment: { type: String, required: false },
      },
    ],
    default: [],
  })
  approvalFlow: ApprovalRecord[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop()
  decisionReason?: string;

  @Prop({ default: false })
  isPostLeaveSubmission?: boolean;

  @Prop({ default: null })
  convertedToUnpaidDays?: number;

  @Prop({ default: null })
  payrollActionId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
