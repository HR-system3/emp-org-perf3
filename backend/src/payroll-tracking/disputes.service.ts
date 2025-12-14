import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Dispute, DisputeDocument } from './models/disputes.schema';
import { CreateDisputeDto } from './dto/disputes/create-dispute.dto';
import { ApproveDisputeDto } from './dto/disputes/approve-dispute.dto';
import { RejectDisputeDto } from './dto/disputes/reject-dispute.dto';
import { DisputeStatus } from './enums/payroll-tracking-enum';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name)
    private readonly disputeModel: Model<DisputeDocument>,
  ) {}

  // Generate DISP-0001 IDs
  private async generateDisputeId(): Promise<string> {
    const count = await this.disputeModel.countDocuments();
    return `DISP-${(count + 1).toString().padStart(4, '0')}`;
  }

  // =============================
  // CREATE DISPUTE
  // =============================
  async createDispute(dto: CreateDisputeDto) {
    const disputeId = await this.generateDisputeId();

    const dispute = new this.disputeModel({
      disputeId,
      description: dto.description,
      employeeId: new mongoose.Types.ObjectId(dto.employeeId),
      payslipId: new mongoose.Types.ObjectId(dto.payslipId),
      status: DisputeStatus.UNDER_REVIEW,
    });

    return dispute.save();
  }

  // =============================
  // GET DISPUTES BY EMPLOYEE
  // =============================
  async getDisputesForEmployee(employeeId: string) {
    return this.disputeModel.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
    });
  }

  // =============================
  // GET DISPUTE BY ID
  // =============================
  async getDisputeById(id: string) {
    const dispute = await this.disputeModel.findById(id);
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  // =============================
  // APPROVE DISPUTE
  // =============================
  async approveDispute(id: string, dto: ApproveDisputeDto) {
    const dispute = await this.getDisputeById(id);

    dispute.status = DisputeStatus.APPROVED;
    dispute.financeStaffId = new mongoose.Types.ObjectId(dto.financeStaffId);
    (dispute as any).resolutionComment = dto.resolutionComment ?? null;

    return dispute.save();
  }

  // =============================
  // REJECT DISPUTE
  // =============================
  async rejectDispute(id: string, dto: RejectDisputeDto) {
    const dispute = await this.getDisputeById(id);

    dispute.status = DisputeStatus.REJECTED;
    dispute.financeStaffId = new mongoose.Types.ObjectId(dto.financeStaffId);
    dispute.rejectionReason = dto.rejectionReason;
    (dispute as any).resolutionComment = dto.resolutionComment ?? null;

    return dispute.save();
  }

  // =============================
  // GET ALL DISPUTES
  // =============================
  async getAllDisputes() {
    return this.disputeModel.find();
  }
}
