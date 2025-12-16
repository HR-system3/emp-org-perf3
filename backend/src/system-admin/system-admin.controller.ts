import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SystemAdminService } from './system-admin.service';
import { AuthGuard } from '../auth/guards/authentication.guard';
import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@Controller('system-admin')
@UseGuards(AuthGuard, authorizationGaurd)
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Get('system-info')
  @Roles(Role.SYSTEM_ADMIN)
  async getSystemInfo() {
    return this.systemAdminService.getSystemInfo();
  }

  @Get('feature-flags')
  @Roles(Role.SYSTEM_ADMIN)
  async getFeatureFlags() {
    return this.systemAdminService.getFeatureFlags();
  }

  @Post('tools/recalculate-org-chart')
  @Roles(Role.SYSTEM_ADMIN)
  async recalculateOrgChart() {
    return this.systemAdminService.recalculateOrgChart();
  }

  @Post('tools/data-integrity-check')
  @Roles(Role.SYSTEM_ADMIN)
  async dataIntegrityCheck() {
    return this.systemAdminService.dataIntegrityCheck();
  }
}
