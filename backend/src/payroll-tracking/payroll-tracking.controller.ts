import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { CreateClaimDto } from './dto/claims/create-claim.dto';
import { ApproveClaimDto } from './dto/claims/approve-claim.dto';
import { RejectClaimDto } from './dto/claims/reject-claim.dto';

@Controller('payroll-tracking')
export class PayrollTrackingController {
  constructor(private service: PayrollTrackingService) {}

  // Create claim
  @Post('claims')
  createClaim(@Body() dto: CreateClaimDto) {
    return this.service.createClaim(dto);
  }

  // Get all claims for employee
  @Get('claims/employee/:employeeId')
  getEmployeeClaims(@Param('employeeId') id: string) {
    return this.service.getClaimsForEmployee(id);
  }

  // Get one claim
  @Get('claims/:id')
  getClaimById(@Param('id') id: string) {
    return this.service.getClaimById(id);
  }

  // Approve claim
  @Patch('claims/:id/approve')
  approveClaim(@Param('id') id: string, @Body() dto: ApproveClaimDto) {
    return this.service.approveClaim(id, dto);
  }

  // Reject claim
  @Patch('claims/:id/reject')
  rejectClaim(@Param('id') id: string, @Body() dto: RejectClaimDto) {
    return this.service.rejectClaim(id, dto);
  }

  // For payroll specialists
  @Get('claims')
  getAllClaims() {
    return this.service.getAllClaims();
  }
}
