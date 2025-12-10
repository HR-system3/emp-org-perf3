import {
  Controller,
  Get,
  Post,
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

import { ApproveRejectLeaveDto } from '../dto/approve-reject-leave.dto';

@Controller('leaves/manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerLeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get('requests')
  async getTeamRequests(@Req() req) {
    const managerId = req.user.userId;
    return this.leavesService.getTeamRequests(managerId);
  }

  @Post('requests/:id/decision')
  async approveReject(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    const managerId = req.user.userId;
    return this.leavesService.managerApproveReject(managerId, id, dto);
  }

  @Post('delegations')
  async createDelegation(@Req() req, @Body() dto: any) {
    const managerId = req.user.userId;
    return this.leavesService.createDelegation(managerId, dto);
  }

  @Get('delegations')
  async getDelegations(@Req() req) {
    const managerId = req.user.userId;
    return this.leavesService.getActiveDelegations(managerId);
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }
}
