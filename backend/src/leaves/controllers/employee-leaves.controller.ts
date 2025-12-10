import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { LeavesService } from '../leaves.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';

@Controller('leaves/employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EMPLOYEE)
export class EmployeeLeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateLeaveRequestDto) {
    const employeeId = req.user.employeeId;
    const userId = req.user.userId;
    return this.leavesService.createLeaveRequest(employeeId, userId, dto);
  }

  @Patch(':id')
  async updatePending(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    const employeeId = req.user.employeeId;
    return this.leavesService.updatePendingRequest(employeeId, id, dto);
  }

  @Delete(':id')
  async cancel(@Req() req, @Param('id') id: string) {
    const employeeId = req.user.employeeId;
    return this.leavesService.cancelPendingRequest(employeeId, id);
  }

  @Get('balance')
  async getBalance(@Req() req) {
    const employeeId = req.user.employeeId;
    return this.leavesService.getEmployeeBalance(employeeId);
  }

  @Get('history')
  async getHistory(@Req() req) {
    const employeeId = req.user.employeeId;
    return this.leavesService.getEmployeeHistory(employeeId);
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Req() req, @Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }
}
