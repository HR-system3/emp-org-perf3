// src/organization-structure/models/position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types, UpdateQuery } from 'mongoose';
import { Department, DepartmentDocument } from './department.schema';
import { PositionStatus } from '../enums/organization-structure.enums';

export type PositionDocument = HydratedDocument<Position>;

@Schema({ collection: 'positions', timestamps: true })
export class Position {
  @Prop({ type: String, required: true, unique: true })
  positionId: string;

  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true })
  jobKey: string;

  @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  payGradeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  reportsToPositionId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(PositionStatus),
    default: PositionStatus.VACANT,
  })
  status: PositionStatus;

  @Prop({ type: String, required: true })
  costCenter: string;

  @Prop({ type: Date })
  effectiveEnd?: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

/* ----------------------------------------------
   Helpers
---------------------------------------------- */

function isObjectIdLike(value: unknown): value is Types.ObjectId | string {
  return typeof value === 'string' || value instanceof Types.ObjectId;
}

async function resolveDepartmentHead(
  departmentModel: Model<DepartmentDocument>,
  departmentId?: Types.ObjectId | string,
  positionId?: Types.ObjectId,
) {
  if (!departmentId) return undefined;

  const dept = await departmentModel
    .findById(departmentId)
    .select('headPositionId')
    .lean<{ headPositionId?: Types.ObjectId }>()
    .exec();

  if (!dept?.headPositionId) return undefined;

  if (positionId && dept.headPositionId.equals(positionId)) {
    return undefined;
  }

  return dept.headPositionId;
}

/* ----------------------------------------------
   Pre-save — Document Middleware
---------------------------------------------- */

PositionSchema.pre('save', async function (next) {
  try {
    const doc = this as PositionDocument;

    // correct way to access a model inside a doc hook
    const DepartmentModel = (
      this.constructor as Model<any>
    ).db.model<DepartmentDocument>(Department.name);

    doc.reportsToPositionId = await resolveDepartmentHead(
      DepartmentModel,
      doc.departmentId,
      doc._id,
    );

    next();
  } catch (err) {
    next(err as Error);
  }
});


/* ----------------------------------------------
   Pre-findOneAndUpdate — Query Middleware
---------------------------------------------- */

PositionSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() as UpdateQuery<Position> | null;
    if (!update) return next();

    let departmentId: Types.ObjectId | string | undefined;

    // 1️⃣ Extract from update
    if (isObjectIdLike((update as any).departmentId)) {
      departmentId = (update as any).departmentId;
    } else if (
      update.$set &&
      isObjectIdLike((update.$set as any).departmentId)
    ) {
      departmentId = (update.$set as any).departmentId;
    }

    // 2️⃣ Otherwise, load the current document
    if (!departmentId) {
      const PositionModel = this.model as Model<PositionDocument>;
      const current = await PositionModel.findOne(this.getQuery())
        .select('departmentId')
        .lean<{ departmentId?: Types.ObjectId }>()
        .exec();

      departmentId = current?.departmentId;
    }

    if (!departmentId) return next();

    // 3️⃣ Get the department model correctly
    const DepartmentModel = this.model.db.model<DepartmentDocument>(Department.name);

    const normalizedId =
      typeof departmentId === 'string'
        ? new Types.ObjectId(departmentId)
        : departmentId;

    // 4️⃣ Resolve head
    const headId = await resolveDepartmentHead(
      DepartmentModel,
      normalizedId,
      (this.getQuery() as any)?._id,
    );

    // 5️⃣ Set reportsToPositionId safely
    if (update.$set) {
      (update.$set as any).reportsToPositionId = headId;
    } else {
      (update as any).$set = { reportsToPositionId: headId };
    }

    this.setUpdate(update);

    next();
  } catch (err) {
    next(err as Error);
  }
});
