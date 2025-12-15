// ./src/employee-profile/employee-profile.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
  } from '@nestjs/common';
  
  import { EmployeeProfileService } from './employee-profile.service';
  import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
  import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
  import { SelfServiceUpdateProfileDto } from './dto/self-service-update-profile.dto';
  import { AssignRoleDto } from './dto/assign-role.dto';
  import { CreateChangeRequestDto } from './dto/create-change-request.dto';
  import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
  import { ProfileChangeStatus } from './enums/employee-profile.enums';
  import { UseGuards } from '@nestjs/common';
  import { AuthGuard } from '../auth/guards/authentication.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../auth/enums/roles.enum';
  
  @UseGuards(AuthGuard, RolesGuard)
  @Controller('employee-profile')
  export class EmployeeProfileController {
    constructor(
      private readonly employeeProfileService: EmployeeProfileService,
    ) {}
  
    // ---------------------------------------------------------------------------
    // HR / System Admin – create & manage profiles
    // ---------------------------------------------------------------------------
  
    @Roles(Role.HR, Role.ADMIN)
    @Post()
    createEmployee(@Body() dto: CreateEmployeeProfileDto) {
      return this.employeeProfileService.createEmployeeProfile(dto);
    }
  
    @Get('employee-number/:employeeNumber')
    getByEmployeeNumber(@Param('employeeNumber') employeeNumber: string) {
      return this.employeeProfileService.getByEmployeeNumber(employeeNumber);
    }
  
    @Patch(':id')
    updateEmployee(
      @Param('id') id: string,
      @Body() dto: UpdateEmployeeProfileDto,
    ) {
      return this.employeeProfileService.updateEmployeeProfile(id, dto);
    }
  
    // ---------------------------------------------------------------------------
    // Self-Service – employee view/update their own profile
    // ---------------------------------------------------------------------------
  
    @Roles(Role.EMPLOYEE, Role.MANAGER, Role.HR, Role.ADMIN)
    @Get(':id/self')
    getSelfProfile(@Param('id') id: string) {
      return this.employeeProfileService.getSelfProfile(id);
    }
  
    @Patch(':id/self')
    updateSelfProfile(
      @Param('id') id: string,
      @Body() dto: SelfServiceUpdateProfileDto,
    ) {
      return this.employeeProfileService.updateSelfServiceProfile(id, dto);
    }
  
    // ---------------------------------------------------------------------------
    // Manager View – team brief
    // ---------------------------------------------------------------------------
  
    @Roles(Role.MANAGER)
    @Get('manager/:managerId/team')
    getManagerTeam(@Param('managerId') managerId: string) {
      return this.employeeProfileService.getTeamBrief(managerId);
    }
  
    // ---------------------------------------------------------------------------
    // Change Requests – employee submit + HR process
    // ---------------------------------------------------------------------------

    @Roles(Role.HR, Role.ADMIN)
    @Get('change-requests')
    listChangeRequests(@Query('status') status?: string) {
      // if nothing is passed, list all
      if (!status) {
        return this.employeeProfileService.listChangeRequests();
      }

      const normalized = status.toUpperCase() as ProfileChangeStatus;
      return this.employeeProfileService.listChangeRequests(normalized);
    }
    @Get(':id')
    getById(@Param('id') id: string) {
      return this.employeeProfileService.getById(id);
    }

    @Post(':id/change-requests')
    createChangeRequest(
      @Param('id') employeeProfileId: string,
      @Body() dto: CreateChangeRequestDto,
    ) {
      return this.employeeProfileService.createChangeRequest(
        employeeProfileId,
        dto,
      );
    }

  
    @Roles(Role.HR, Role.ADMIN)
    @Patch('change-requests/:requestId')
    processChangeRequest(
      @Param('requestId') requestId: string,
      @Body() dto: ProcessChangeRequestDto,
    ) {
      return this.employeeProfileService.processChangeRequest(
        requestId,
        dto,
      );
    }
    
    // ---------------------------------------------------------------------------
    // Roles & access profile
    // ---------------------------------------------------------------------------
  
    @Roles(Role.HR, Role.ADMIN)
    @Post(':id/roles')
    assignRoles(
      @Param('id') employeeProfileId: string,
      @Body() dto: AssignRoleDto,
    ) {
      return this.employeeProfileService.assignRoles(employeeProfileId, dto);
    }

    @Get()
    async listEmployees(@Query('search') search?: string) {
      return this.employeeProfileService.findAll(search);
    }
  }
  