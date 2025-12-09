import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { HydratedDocument } from 'mongoose';

export type AttachmentDocument = HydratedDocument<Attachment>;

export enum AttachmentType {
  MEDICAL = 'MEDICAL',
  ID = 'ID',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop()
  fileType?: string;

  @Prop({ required: true })
  uploadedBy: string; // user id or system actor

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  meta?: Record<string, any>;

}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
