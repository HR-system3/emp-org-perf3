import { 
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  BadRequestException 
} from '@nestjs/common';

import { PayrollConfigurationService } from './payroll-configuration.service';

import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';

import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';

import { CreateTerminationBenefitDto } from './dto/create-termination-benefit.dto';
import { UpdateTerminationBenefitDto } from './dto/update-termination-benefit.dto';

@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly service: PayrollConfigurationService,
  ) {}

  // ------------------------------
  // ALLOWANCE
  // ------------------------------
  @Post('allowance')
  createAllowance(@Body() dto: CreateAllowanceDto) {
    return this.service.createAllowance(dto);
  }

  @Get('allowance')
  listAllowance() {
    return this.service.findAllAllowances();
  }

  @Get('allowance/:id')
  findAllowance(@Param('id') id: string) {
    return this.service.findAllowanceById(id);
  }

  @Put('allowance/:id')
  updateAllowance(
    @Param('id') id: string,
    @Body() dto: UpdateAllowanceDto,
  ) {
    return this.service.updateAllowance(id, dto);
  }

  // ------------------------------
  // PAY GRADE
  // ------------------------------
  @Post('pay-grade')
  createPayGrade(@Body() dto: CreatePayGradeDto) {
    return this.service.createPayGrade(dto);
  }

  @Get('pay-grade')
  listPayGrades() {
    return this.service.findAllPayGrades();
  }

  @Get('pay-grade/:id')
  findPayGrade(@Param('id') id: string) {
    return this.service.findPayGradeById(id);
  }

  @Put('pay-grade/:id')
  updatePayGrade(
    @Param('id') id: string,
    @Body() dto: UpdatePayGradeDto,
  ) {
    return this.service.updatePayGrade(id, dto);
  }

  // ------------------------------
  // TERMINATION BENEFITS
  // ------------------------------
  @Post('termination-benefit')
  createTerminationBenefit(@Body() dto: CreateTerminationBenefitDto) {
    return this.service.createTerminationBenefit(dto);
  }

  @Get('termination-benefit')
  listTerminationBenefits() {
    return this.service.findAllTerminationBenefits();
  }

  @Get('termination-benefit/:id')
  findTerminationBenefit(@Param('id') id: string) {
    return this.service.findTerminationBenefitById(id);
  }

  @Put('termination-benefit/:id')
  updateTerminationBenefit(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationBenefitDto,
  ) {
    return this.service.updateTerminationBenefit(id, dto);
  }

  // ------------------------------
  // STRUCTURE OVERVIEW
  // ------------------------------
  @Get('structure')
  getStructure() {
    return this.service.getFullStructure();
  }
}
