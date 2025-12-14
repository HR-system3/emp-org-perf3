import { Controller, Post, Body } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApproveConfigDto } from './dto/approve-config.dto';

@Controller('payroll/config')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('approve')
  approveConfig(@Body() dto: ApproveConfigDto) {
    return this.approvalService.approve(dto);
  }
}