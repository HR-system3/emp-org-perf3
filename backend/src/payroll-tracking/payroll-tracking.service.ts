import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim, ClaimsDocument } from './models/claims.schema';
import { CreateClaimDto } from './dto/claims/create-claim.dto';
import { ApproveClaimDto } from './dto/claims/approve-claim.dto';
import { RejectClaimDto } from './dto/claims/reject-claim.dto';
import { ClaimStatus } from './enums/payroll-tracking-enum';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(Claim.name)
    private claimModel: Model<ClaimsDocument>,
  ) {}

  // Generate CLAIM-0001, CLAIM-0002...
  private async generateClaimId(): Promise<string> {
    const count = await this.claimModel.countDocuments();
    const id = (count + 1).toString().padStart(4, '0');
    return `CLAIM-${id}`;
  }

  // Create a claim
  async createClaim(dto: CreateClaimDto) {
    const claimId = await this.generateClaimId();

    return this.claimModel.create({
      claimId,
      description: dto.description,
      claimType: dto.claimType,
      employeeId: dto.employeeId,
      amount: dto.amount,
      status: ClaimStatus.UNDER_REVIEW,
    });
  }

  // Get all claims for employee
  async getClaimsForEmployee(employeeId: string) {
    return this.claimModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get claim by its Mongo _id
  async getClaimById(id: string) {
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  // Approve
  async approveClaim(id: string, dto: ApproveClaimDto) {
    const claim = await this.getClaimById(id);

    claim.status = ClaimStatus.APPROVED;
    claim.approvedAmount = dto.approvedAmount;
    claim.financeStaffId = dto.financeStaffId as any;
    claim.resolutionComment = dto.resolutionComment;

    return claim.save();
  }

  // Reject
  async rejectClaim(id: string, dto: RejectClaimDto) {
    const claim = await this.getClaimById(id);

    claim.status = ClaimStatus.REJECTED;
    claim.rejectionReason = dto.rejectionReason;
    claim.financeStaffId = dto.financeStaffId as any;
    claim.resolutionComment = dto.resolutionComment;

    return claim.save();
  }

  // For payroll specialists
  async getAllClaims() {
    return this.claimModel.find().sort({ createdAt: -1 }).exec();
  }
}
