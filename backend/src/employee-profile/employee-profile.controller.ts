// ./src/employee-profile/employee-profile.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
  } from '@nestjs/common';
  
  import { EmployeeProfileService } from './employee-profile.service';
  import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
  import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
  import { SelfServiceUpdateProfileDto } from './dto/self-service-update-profile.dto';
  import { AssignRoleDto } from './dto/assign-role.dto';
  import { CreateChangeRequestDto } from './dto/create-change-request.dto';
  import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
  import { ProfileChangeStatus } from './enums/employee-profile.enums';
  import { AuthGuard } from '../auth/guards/authentication.guard';
  import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../auth/enums/roles.enum';
  
  @Controller('employee-profile')
  @UseGuards(AuthGuard, authorizationGaurd)
  export class EmployeeProfileController {
    constructor(
      private readonly employeeProfileService: EmployeeProfileService,
    ) {}
  
    // ---------------------------------------------------------------------------
    // HR / System Admin – create & manage profiles
    // ---------------------------------------------------------------------------
  
    @Post()
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
    async createEmployee(@Body() dto: CreateEmployeeProfileDto) {
      try {
        return await this.employeeProfileService.createEmployeeProfile(dto);
      } catch (error: any) {
        // Log the error for debugging
        console.error('Error creating employee:', error);
        
        // Return a user-friendly error message
        throw new Error(
          error.message || 'Failed to create employee profile. Please check all required fields are provided and valid.'
        );
      }
    }
  
    @Get('employee-number/:employeeNumber')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
    getByEmployeeNumber(@Param('employeeNumber') employeeNumber: string) {
      return this.employeeProfileService.getByEmployeeNumber(employeeNumber);
    }
  
    @Patch(':id')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
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
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    getSelfProfile(@Param('id') id: string) {
      return this.employeeProfileService.getSelfProfile(id);
    }
  
    @Patch(':id/self')
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
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
    @Roles(Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    getManagerTeam(@Param('managerId') managerId: string) {
      return this.employeeProfileService.getTeamBrief(managerId);
    }
  
    // ---------------------------------------------------------------------------
    // Change Requests – employee submit + HR process
    // ---------------------------------------------------------------------------

    @Get('change-requests')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    listChangeRequests(@Query('status') status?: string) {
      // if nothing is passed, list all
      if (!status) {
        return this.employeeProfileService.listChangeRequests();
      }

      const normalized = status.toUpperCase() as ProfileChangeStatus;
      return this.employeeProfileService.listChangeRequests(normalized);
    }
    
    @Get(':id')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
    getById(@Param('id') id: string) {
      return this.employeeProfileService.getById(id);
    }

    @Post(':id/change-requests')
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
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
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
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
    @Roles(Role.SYSTEM_ADMIN, Role.HR_ADMIN)
    assignRoles(
      @Param('id') employeeProfileId: string,
      @Body() dto: AssignRoleDto,
    ) {
      return this.employeeProfileService.assignRoles(employeeProfileId, dto);
    }

    @Get()
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
    async listEmployees(@Query('search') search?: string) {
      return this.employeeProfileService.findAll(search);
    }
  }
  