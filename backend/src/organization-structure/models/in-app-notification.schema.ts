import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InAppNotificationDocument = HydratedDocument<InAppNotification>;

@Schema({ collection: 'in_app_notifications', timestamps: true })
export class InAppNotification {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true })
  recipientEmployeeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' })
  type: 'info' | 'warning' | 'success' | 'error';

  @Prop({ type: String, enum: [
    'DEPARTMENT_CREATED',
    'DEPARTMENT_UPDATED',
    'POSITION_CREATED',
    'POSITION_UPDATED',
    'POSITION_DEACTIVATED',
    'POSITION_DELIMITED',
    'CHANGE_REQUEST_SUBMITTED',
    'CHANGE_REQUEST_APPROVED',
    'CHANGE_REQUEST_REJECTED',
    'REPORTING_LINE_CHANGED',
  ], required: true })
  eventType: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  actionUrl?: string; // URL to navigate to when notification is clicked
}

export const InAppNotificationSchema = SchemaFactory.createForClass(InAppNotification);

// Index for efficient queries
InAppNotificationSchema.index({ recipientEmployeeId: 1, isRead: 1, createdAt: -1 });
