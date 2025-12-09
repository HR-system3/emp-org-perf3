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
  
  @Controller('employee-profile')
  export class EmployeeProfileController {
    constructor(
      private readonly employeeProfileService: EmployeeProfileService,
    ) {}
  
    // ---------------------------------------------------------------------------
    // HR / System Admin – create & manage profiles
    // ---------------------------------------------------------------------------
  
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
  
    @Get('manager/:managerId/team')
    getManagerTeam(@Param('managerId') managerId: string) {
      return this.employeeProfileService.getTeamBrief(managerId);
    }
  
    // ---------------------------------------------------------------------------
    // Change Requests – employee submit + HR process
    // ---------------------------------------------------------------------------

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
  
    @Post(':id/roles')
    assignRoles(
      @Param('id') employeeProfileId: string,
      @Body() dto: AssignRoleDto,
    ) {
      return this.employeeProfileService.assignRoles(employeeProfileId, dto);
    }
  }
  