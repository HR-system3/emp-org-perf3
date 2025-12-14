import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RefundsService } from './refund.service';
import { CreateRefundDto } from './dto/refunds/create-refund.dto';
import { MarkRefundPaidDto } from './dto/refunds/mark-refund-paid.dto';

@Controller('payroll-tracking/refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  createRefund(@Body() dto: CreateRefundDto) {
    return this.refundsService.createRefund(dto);
  }

  @Get()
  getAllRefunds() {
    return this.refundsService.getAllRefunds();
  }

  @Get(':id')
  getRefundById(@Param('id') id: string) {
    return this.refundsService.getRefundById(id);
  }

  @Get('employee/:employeeId')
  getForEmployee(@Param('employeeId') employeeId: string) {
    return this.refundsService.getRefundsForEmployee(employeeId);
  }

  @Patch(':id/paid')
  markPaid(@Param('id') id: string, @Body() dto: MarkRefundPaidDto) {
    return this.refundsService.markRefundPaid(id, dto);
  }
}