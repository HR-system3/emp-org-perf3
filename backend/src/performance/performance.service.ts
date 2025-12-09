import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AppraisalTemplate,
  AppraisalTemplateDocument,
} from './models/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleDocument,
} from './models/appraisal-cycle.schema';
import {
  AppraisalAssignment,
  AppraisalAssignmentDocument,
} from './models/appraisal-assignment.schema';

import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from './models/appraisal-record.schema';
import {
  AppraisalDispute,
  AppraisalDisputeDocument,
} from './models/appraisal-dispute.schema';
import {
  AppraisalAssignmentStatus,
  AppraisalRecordStatus,
  AppraisalDisputeStatus,
} from './enums/performance.enums';
import {
  CreateAppraisalTemplateDto,
  UpdateAppraisalTemplateDto,
} from './dto/appraisal-template.dto';
import {
  CreateAppraisalCycleDto,
  UpdateAppraisalCycleDto,
} from './dto/appraisal-cycle.dto';
import { BulkAssignAppraisalsDto } from './dto/appraisal-assignment.dto';
import {
  AcknowledgeAppraisalRecordDto,
  CreateAppraisalRecordDto,
  CreateDisputeDto,
  DisputeResolutionAction,
  PublishAppraisalRecordDto,
  ResolveDisputeDto,
  UpdateAppraisalRecordDto,
} from './dto/appraisal-record-dispute.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private readonly templateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name)
    private readonly cycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalAssignment.name)
    private readonly assignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalRecord.name)
    private readonly recordModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalDispute.name)
    private readonly disputeModel: Model<AppraisalDisputeDocument>,
  ) {}

  // ---------- TEMPLATES (Step 1) ----------

  async createTemplate(dto: CreateAppraisalTemplateDto) {
    // simple create – minimal logic for Milestone 2
    const template = await this.templateModel.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return template;
  }

  findAllTemplates() {
    return this.templateModel.find().exec();
  }

  async findTemplateById(id: string) {
    const template = await this.templateModel.findById(id).exec();
    if (!template) throw new NotFoundException('Appraisal template not found');
    return template;
  }

async updateTemplate(id: string, dto: UpdateAppraisalTemplateDto) {
  const updated = await this.templateModel
    .findByIdAndUpdate(id, dto, { new: true })
    .exec();
  if (!updated) throw new NotFoundException('Appraisal template not found');
  return updated;
}

// ---------- CYCLES (Step 2) ----------

createCycle(dto: CreateAppraisalCycleDto) {
    const payload: Partial<AppraisalCycle> = {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      managerDueDate: dto.managerDueDate
        ? new Date(dto.managerDueDate)
        : undefined,
      employeeAcknowledgementDueDate: dto.employeeAcknowledgementDueDate
        ? new Date(dto.employeeAcknowledgementDueDate)
        : undefined,
      templateAssignments: dto.templateAssignments?.map((ta) => ({
        ...ta,
        templateId: new Types.ObjectId(ta.templateId),
        departmentIds: ta.departmentIds?.map((id) => new Types.ObjectId(id)),
      })),
    };
    return this.cycleModel.create(payload);
  }

  findAllCycles(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.cycleModel.find(filter).exec();
  }

  findCycleById(id: string) {
    return this.cycleModel.findById(id).exec();
  }

  updateCycle(id: string, dto: UpdateAppraisalCycleDto) {
    const payload: any = { ...dto };
    if (dto.startDate) payload.startDate = new Date(dto.startDate);
    if (dto.endDate) payload.endDate = new Date(dto.endDate);
    if (dto.managerDueDate)
      payload.managerDueDate = new Date(dto.managerDueDate);
    if (dto.employeeAcknowledgementDueDate)
      payload.employeeAcknowledgementDueDate = new Date(
        dto.employeeAcknowledgementDueDate,
      );

    return this.cycleModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }

  // ---------- ASSIGNMENTS (Step 3A) ----------

  async bulkAssign(dto: BulkAssignAppraisalsDto) {
    const docs = dto.assignments.map((a) => ({
      cycleId: new Types.ObjectId(dto.cycleId),
      templateId: new Types.ObjectId(dto.templateId),
      employeeProfileId: new Types.ObjectId(a.employeeProfileId),
      managerProfileId: new Types.ObjectId(a.managerProfileId),
      departmentId: new Types.ObjectId(a.departmentId),
      positionId: a.positionId ? new Types.ObjectId(a.positionId) : undefined,
      dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
      status: AppraisalAssignmentStatus.NOT_STARTED,
    }));

    return this.assignmentModel.insertMany(docs);
  }

  getAssignments(filters: {
    cycleId?: string;
    managerProfileId?: string;
    employeeProfileId?: string;
    status?: AppraisalAssignmentStatus;
  }) {
    const query: any = {};
    if (filters.cycleId) query.cycleId = filters.cycleId;
    if (filters.managerProfileId)
      query.managerProfileId = filters.managerProfileId;
    if (filters.employeeProfileId)
      query.employeeProfileId = filters.employeeProfileId;
    if (filters.status) query.status = filters.status;
    return this.assignmentModel.find(query).exec();
  }

  // ---------- RECORDS (Steps 3B, 4, 5) ----------

  async createRecord(dto: CreateAppraisalRecordDto) {
    const record = await this.recordModel.create({
      ...dto,
      cycleId: new Types.ObjectId(dto.cycleId),
      assignmentId: new Types.ObjectId(dto.assignmentId),
      templateId: new Types.ObjectId(dto.templateId),
      employeeProfileId: new Types.ObjectId(dto.employeeProfileId),
      managerProfileId: new Types.ObjectId(dto.managerProfileId),
      status: AppraisalRecordStatus.DRAFT,
    });

    // when record exists, mark assignment in progress
    await this.assignmentModel
      .findByIdAndUpdate(dto.assignmentId, {
        status: AppraisalAssignmentStatus.IN_PROGRESS,
        latestAppraisalId: record._id,
        submittedAt: undefined,
      })
      .exec();

    return record;
  }

  findRecordById(id: string) {
    return this.recordModel.findById(id).exec();
  }

  async updateRecord(id: string, dto: UpdateAppraisalRecordDto) {
    const record = await this.recordModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException('Appraisal record not found');
    return record;
  }

  async submitByManager(id: string) {
    const now = new Date();
    const record = await this.recordModel
      .findByIdAndUpdate(
        id,
        { status: AppraisalRecordStatus.MANAGER_SUBMITTED, managerSubmittedAt: now },
        { new: true },
      )
      .exec();

    if (!record) throw new NotFoundException('Appraisal record not found');

    await this.assignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.SUBMITTED,
        submittedAt: now,
      })
      .exec();

    return record;
  }

  async publishRecord(id: string, dto: PublishAppraisalRecordDto) {
    const now = new Date();
    const record = await this.recordModel
      .findByIdAndUpdate(
        id,
        {
          status: AppraisalRecordStatus.HR_PUBLISHED,
          hrPublishedAt: now,
          publishedByEmployeeId: new Types.ObjectId(dto.publishedByEmployeeId),
        },
        { new: true },
      )
      .exec();

    if (!record) throw new NotFoundException('Appraisal record not found');

    await this.assignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.PUBLISHED,
        publishedAt: now,
      })
      .exec();

    return record;
  }

  async acknowledgeRecord(id: string, dto: AcknowledgeAppraisalRecordDto) {
    const now = new Date();
    const record = await this.recordModel
      .findByIdAndUpdate(
        id,
        {
          employeeViewedAt: now,
          employeeAcknowledgedAt: now,
          employeeAcknowledgementComment: dto.employeeAcknowledgementComment,
        },
        { new: true },
      )
      .exec();

    if (!record) throw new NotFoundException('Appraisal record not found');

    await this.assignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.ACKNOWLEDGED,
      })
      .exec();

    return record;
  }

  getEmployeeRecords(employeeProfileId: string) {
    return this.recordModel
      .find({ employeeProfileId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCycleProgress(cycleId: string) {
    const assignments = await this.assignmentModel
      .find({ cycleId })
      .select('status')
      .lean();

    const counts: Record<string, number> = {
      [AppraisalAssignmentStatus.NOT_STARTED]: 0,
      [AppraisalAssignmentStatus.IN_PROGRESS]: 0,
      [AppraisalAssignmentStatus.SUBMITTED]: 0,
      [AppraisalAssignmentStatus.PUBLISHED]: 0,
      [AppraisalAssignmentStatus.ACKNOWLEDGED]: 0,
    };

    for (const a of assignments) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }

    return {
      cycleId,
      totalAssignments: assignments.length,
      byStatus: counts,
    };
  }

  // ---------- DISPUTES (Steps 6, 7) ----------

  createDispute(dto: CreateDisputeDto) {
    return this.disputeModel.create({
      ...dto,
      appraisalId: new Types.ObjectId(dto.appraisalId),
      assignmentId: new Types.ObjectId(dto.assignmentId),
      cycleId: new Types.ObjectId(dto.cycleId),
      raisedByEmployeeId: new Types.ObjectId(dto.raisedByEmployeeId),
      status: AppraisalDisputeStatus.OPEN,
      submittedAt: new Date(),
    });
  }

  getDisputes(filters: {
    cycleId?: string;
    employeeProfileId?: string;
    status?: AppraisalDisputeStatus;
  }) {
    const query: any = {};
    if (filters.cycleId) query.cycleId = filters.cycleId;
    if (filters.employeeProfileId)
      query.raisedByEmployeeId = filters.employeeProfileId;
    if (filters.status) query.status = filters.status;
    return this.disputeModel.find(query).exec();
  }

  async resolveDispute(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.disputeModel
      .findById(id)
      .exec();

    if (!dispute) throw new NotFoundException('Dispute not found');

    const now = new Date();

    if (dto.action === DisputeResolutionAction.REJECT) {
      dispute.status = AppraisalDisputeStatus.REJECTED;
    } else {
      dispute.status = AppraisalDisputeStatus.ADJUSTED;

      if (dto.updatedTotalScore || dto.updatedOverallRatingLabel) {
        await this.recordModel
          .findByIdAndUpdate(dispute.appraisalId, {
            totalScore: dto.updatedTotalScore,
            overallRatingLabel: dto.updatedOverallRatingLabel,
          })
          .exec();
      }
    }

    dispute.resolutionSummary = dto.resolutionSummary;
    dispute.resolvedAt = now;
    dispute.resolvedByEmployeeId = new Types.ObjectId(
      dto.resolvedByEmployeeId,
    );

    await dispute.save();
    return dispute;
  }
  
}
