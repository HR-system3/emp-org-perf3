import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { refunds, refundsDocument } from './models/refunds.schema';
import { CreateRefundDto } from './dto/refunds/create-refund.dto';
import { MarkRefundPaidDto } from './dto/refunds/mark-refund-paid.dto';
import { RefundStatus } from './enums/payroll-tracking-enum';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(refunds.name)
    private readonly refundModel: Model<refunds>,
  ) {}

  async createRefund(dto: CreateRefundDto) {
    const refund = new this.refundModel({
      claimId: dto.claimId,
      disputeId: dto.disputeId,
      refundDetails: dto.refundDetails,
      employeeId: dto.employeeId,
      financeStaffId: dto.financeStaffId,
      status: RefundStatus.PENDING,
    });

    return refund.save();
  }

  async getAllRefunds() {
    return this.refundModel.find().exec();
  }

  async getRefundsForEmployee(employeeId: string) {
    return this.refundModel.find({ employeeId }).exec();
  }

  async getRefundById(id: string) {
    const refund = await this.refundModel.findById(id).exec();
    if (!refund) throw new NotFoundException('Refund not found');
    return refund;
  }

  async markRefundPaid(id: string, dto: MarkRefundPaidDto) {
    const refund = await this.getRefundById(id);

    refund.status = RefundStatus.PAID;
    refund.financeStaffId = dto.financeStaffId as any;
    refund.paidInPayrollRunId = dto.paidInPayrollRunId as any;

    return refund.save();
  }
}
