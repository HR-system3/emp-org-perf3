// ./src/employee-profile/employee-profile.controller.ts
import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import type { Request } from 'express';
  
  import { EmployeeProfileService } from './employee-profile.service';
  import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
  import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
  import { SelfServiceUpdateProfileDto } from './dto/self-service-update-profile.dto';
  import { AssignRoleDto } from './dto/assign-role.dto';
  import { AssignPositionDepartmentDto } from './dto/assign-position-department.dto';
  import { CreateChangeRequestDto } from './dto/create-change-request.dto';
  import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
  import { ProfileChangeStatus } from './enums/employee-profile.enums';
  import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
  import { AuthGuard } from '../auth/guards/authentication.guard';
  import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../auth/enums/roles.enum';
  import { UsersService } from '../users/users.service';
  
  @Controller('employee-profile')
  @UseGuards(AuthGuard, authorizationGaurd)
  export class EmployeeProfileController {
    constructor(
      private readonly employeeProfileService: EmployeeProfileService,
      private readonly usersService: UsersService,
    ) {}
  
    // ---------------------------------------------------------------------------
    // HR / System Admin – create & manage profiles
    // ---------------------------------------------------------------------------
  
    @Get()
    @Roles(
      Role.HR_ADMIN,
      Role.HR_MANAGER,
      Role.HR_EMPLOYEE,
      Role.DEPARTMENT_HEAD,
      Role.DEPARTMENT_EMPLOYEE,
      Role.SYSTEM_ADMIN,
    )
  async listEmployees(@Query('departmentId') departmentId?: string, @Req() req?: Request) {
    const role = (req as any)?.user?.role;
    console.log('[DeptHead][Employees][all]', {
      userid: (req as any)?.user?.userid,
      role,
      requestedDeptId: departmentId,
    });
    return this.employeeProfileService.listEmployees(departmentId);
    }

    @Post()
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
    async createEmployee(@Body() dto: CreateEmployeeProfileDto, @Req() req: Request) {
      try {
        // Debug logging for authorization
        const userPayload = (req as any).user;
        console.log('[Create Employee] User payload:', {
          userid: userPayload?.userid,
          role: userPayload?.role,
          name: userPayload?.name,
        });
        
        return await this.employeeProfileService.createEmployeeProfile(dto);
      } catch (error: any) {
        // Log the error for debugging
        console.error('Error creating employee:', error);
        
        // Return a user-friendly error message with proper HTTP status
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          error.message || 'Failed to create employee profile. Please check all required fields are provided and valid.',
          error.status || HttpStatus.BAD_REQUEST,
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

    @Patch(':id/assign-position-department')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
    @ApiOperation({
      summary: 'Assign position and department to employee',
      description: 'Assigns position, department, and optionally supervisor to an employee profile. Restricted to HR Admin, HR Manager, and System Admin only.',
    })
    @ApiParam({ name: 'id', description: 'Employee Profile ID' })
    @ApiResponse({ status: 200, description: 'Position and department assigned successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden: Only HR roles can assign positions' })
    @ApiResponse({ status: 404, description: 'Employee profile, position, or department not found' })
    @ApiResponse({ status: 400, description: 'Invalid assignment (position not in department, circular reporting, etc.)' })
    async assignPositionDepartment(
      @Param('id') id: string,
      @Body() dto: AssignPositionDepartmentDto,
    ) {
      return this.employeeProfileService.assignPositionDepartment(id, dto);
    }

    @Patch(':id/deactivate')
    @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
    async deactivateEmployee(
      @Param('id') id: string,
      @Body('reason') reason: string | undefined,
      @Req() req: Request,
    ) {
      const userPayload = (req as any).user;
      const performedBy = userPayload?.userid as string | undefined;
      return this.employeeProfileService.deactivateEmployeeProfile(
        id,
        reason,
        performedBy,
      );
    }
  
    // ---------------------------------------------------------------------------
    // Self-Service – employee view/update their own profile
    // ---------------------------------------------------------------------------
  
    @Get('me/self')
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    async getMySelfProfile(@Req() req: Request) {
      let userEmail: string | undefined;
      
      try {
        console.log('[getMySelfProfile] ===== START =====');
        const userPayload = (req as any).user;
        
        if (!userPayload || !userPayload.userid) {
          console.error('[getMySelfProfile] No user payload');
          throw new NotFoundException('User authentication information not found');
        }
        
        const userId = userPayload.userid;
        console.log('[getMySelfProfile] User ID:', userId);
        
        const user = await this.usersService.findById(userId);
        
        if (!user) {
          console.error('[getMySelfProfile] User not found');
          throw new NotFoundException(`User not found with ID: ${userId}`);
        }
        
        userEmail = (user as any).email;
        if (!userEmail) {
          console.error('[getMySelfProfile] No email in user object');
          throw new NotFoundException('User email not found. Please contact your administrator.');
        }
        
        console.log('[getMySelfProfile] User email:', userEmail);
        console.log('[getMySelfProfile] Calling getByEmail...');
        
        const profile = await this.employeeProfileService.getByEmail(userEmail);
        
        if (!profile) {
          console.warn('[getMySelfProfile] Profile not found, returning fallback user info');
          // Return a minimal fallback so the frontend can still render basic info
          return {
            _id: userId,
            firstName: user?.name || 'User',
            lastName: '',
            personalEmail: userEmail,
            status: 'INACTIVE',
            message: 'Employee profile not found. Please create/align an employee profile for this user.',
          };
        }
        
        console.log('[getMySelfProfile] Profile found, ID:', (profile as any)._id);
        console.log('[getMySelfProfile] ===== SUCCESS =====');
        
        // Ensure we return a plain object, not a Mongoose document
        const profileObj = JSON.parse(JSON.stringify(profile));
        return profileObj;
        
      } catch (error: any) {
        console.error('[getMySelfProfile] ===== ERROR =====');
        console.error('[getMySelfProfile] Error type:', error?.constructor?.name);
        console.error('[getMySelfProfile] Error message:', error?.message);
        console.error('[getMySelfProfile] Error stack:', error?.stack);
        
        // If it's already an HttpException, rethrow it
        if (error instanceof HttpException || error instanceof NotFoundException) {
          throw error;
        }
        
        // For unexpected errors, return 500 with detailed message
        const errorMessage = error?.message || String(error) || 'Internal server error';
        console.error('[getMySelfProfile] Throwing 500:', errorMessage);
        
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Failed to load profile: ${errorMessage}`,
            error: 'An unexpected error occurred while fetching your profile',
            userEmail: userEmail || 'unknown',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get(':id/self')
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    getSelfProfile(@Param('id') id: string) {
      return this.employeeProfileService.getSelfProfile(id);
    }

    @Get('me/reports')
    @Roles(Role.DEPARTMENT_HEAD, Role.HR_MANAGER, Role.HR_ADMIN, Role.SYSTEM_ADMIN)
    async getMyReports(@Req() req: Request) {
      const userPayload = (req as any).user;
      if (!userPayload?.userid) {
        throw new NotFoundException('User authentication information not found');
      }
      const userId = userPayload.userid;
      const user = await this.usersService.findById(userId);
      if (!user?.email) {
        throw new NotFoundException('User email not found');
      }

      const profile = await this.employeeProfileService.getByEmail((user as any).email);
      const profileId = (profile as any)?._id;
      if (!profileId) {
        throw new NotFoundException('Employee profile not found for your account');
      }

      return this.employeeProfileService.getReportsForHead(profileId.toString());
    }
  
    @Patch('me/self')
    @Roles(Role.DEPARTMENT_EMPLOYEE, Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    async updateMySelfProfile(
      @Req() req: Request,
      @Body() dto: SelfServiceUpdateProfileDto,
    ) {
      try {
        const userPayload = (req as any).user;
        if (!userPayload || !userPayload.userid) {
          throw new NotFoundException('User authentication information not found');
        }
        
        const userId = userPayload.userid;
        const user = await this.usersService.findById(userId);
        
        if (!user) {
          throw new NotFoundException(`User not found with ID: ${userId}`);
        }
        
        if (!user.email) {
          throw new NotFoundException('User email not found');
        }
        
        // Find employee profile by email and update
        return await this.employeeProfileService.updateSelfServiceProfile(user.email, dto);
      } catch (error: any) {
        console.error('Error in updateMySelfProfile:', error);
        console.error('Error stack:', error.stack);
        if (error instanceof NotFoundException || error instanceof HttpException) {
          throw error;
        }
        // For unexpected errors, return 500 with detailed message
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Failed to update profile: ${error.message || 'Unknown error'}`,
            error: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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

    @Get('manager/:managerId/team/reporting-structure')
    @Roles(Role.DEPARTMENT_HEAD, Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN)
    getTeamByReportingStructure(@Param('managerId') managerId: string) {
      return this.employeeProfileService.getTeamByReportingStructure(managerId);
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
    @Roles(Role.SYSTEM_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER)
    assignRoles(
      @Param('id') employeeProfileId: string,
      @Body() dto: AssignRoleDto,
    ) {
      return this.employeeProfileService.assignRoles(employeeProfileId, dto);
    }

  }
  