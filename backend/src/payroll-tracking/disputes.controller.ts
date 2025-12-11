import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
  } from '@nestjs/common';
  import { DisputesService } from './disputes.service';
  import { CreateDisputeDto } from './dto/disputes/create-dispute.dto';
  import { ApproveDisputeDto } from './dto/disputes/approve-dispute.dto';
  import { RejectDisputeDto } from './dto/disputes/reject-dispute.dto';
  
  @Controller('payroll-tracking/disputes')
  export class DisputesController {
    constructor(private readonly disputesService: DisputesService) {}
  
    @Post()
    createDispute(@Body() dto: CreateDisputeDto) {
      return this.disputesService.createDispute(dto);
    }
  
    @Get('employee/:employeeId')
    getByEmployee(@Param('employeeId') employeeId: string) {
      return this.disputesService.getDisputesForEmployee(employeeId);
    }
  
    @Get(':id')
    getById(@Param('id') id: string) {
      return this.disputesService.getDisputeById(id);
    }
  
    @Patch(':id/approve')
    approve(@Param('id') id: string, @Body() dto: ApproveDisputeDto) {
      return this.disputesService.approveDispute(id, dto);
    }
  
    @Patch(':id/reject')
    reject(@Param('id') id: string, @Body() dto: RejectDisputeDto) {
      return this.disputesService.rejectDispute(id, dto);
    }
  
    @Get()
    getAll() {
      return this.disputesService.getAllDisputes();
    }
  }
  