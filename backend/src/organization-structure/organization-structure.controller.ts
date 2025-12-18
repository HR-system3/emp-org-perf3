import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationStructureService } from './organization-structure.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { DelimitPositionDto } from './dto/delimit-position.dto';
import { GetHierarchyQueryDto } from './dto/get-hierarchy-query.dto';
import { SubmitChangeRequestDto } from './dto/submit-change-request.dto';
import { ApproveChangeRequestDto } from './dto/approve-change-request.dto';
import { AuthGuard } from '../auth/guards/authentication.guard';
import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import type { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/models/user.schema';

@ApiTags('Organization Structure')
@Controller('organization-structure')
@UseGuards(AuthGuard, authorizationGaurd)
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private async getDepartmentIdForUser(req: Request): Promise<string | null> {
    const payload = (req as any).user;
    if (!payload?.userid) return null;
    const user = await this.userModel.findById(payload.userid).lean().exec();
    if (!user?.email) return null;
    const profile = await this.employeeProfileModel
      .findOne({ personalEmail: user.email })
      .select('primaryDepartmentId')
      .lean()
      .exec();
    const deptId = profile?.primaryDepartmentId;
    return deptId ? deptId.toString() : null;
  }

  // ==================== Department Endpoints ====================

  @Post('departments')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Create a new department',
    description: 'Creates a new department with the provided information (BR-5, BR-30)',
  })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationStructureService.createDepartment(dto);
  }

  @Get('departments')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Retrieves a list of all departments',
  })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async getAllDepartments(@Req() req: Request) {
    const role = ((req as any).user?.role || '').toLowerCase();
    const isDeptScoped =
      role === Role.DEPARTMENT_HEAD.toLowerCase() ||
      role === Role.DEPARTMENT_EMPLOYEE.toLowerCase();

    if (isDeptScoped) {
      const deptId = await this.getDepartmentIdForUser(req);
      console.log('[DeptHead][Departments][all]', {
        userid: (req as any).user?.userid,
        role: (req as any).user?.role,
        resolvedDeptId: deptId,
      });
      if (!deptId) {
        throw new ForbiddenException('No department assigned to your profile');
      }
      const depts = await this.organizationStructureService.getAllDepartments();
      return depts.filter((d) => d._id.toString() === deptId);
    }

    return this.organizationStructureService.getAllDepartments();
  }

  @Get('departments/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get department by ID',
    description: 'Retrieves a specific department by its ID',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(@Param('id') id: string, @Req() req: Request) {
    const role = ((req as any).user?.role || '').toLowerCase();
    const isDeptScoped =
      role === Role.DEPARTMENT_HEAD.toLowerCase() ||
      role === Role.DEPARTMENT_EMPLOYEE.toLowerCase();

    if (isDeptScoped) {
      const deptId = await this.getDepartmentIdForUser(req);
      console.log('[DeptHead][Departments][byId]', {
        userid: (req as any).user?.userid,
        role: (req as any).user?.role,
        resolvedDeptId: deptId,
        requestedId: id,
      });
      if (!deptId) {
        throw new ForbiddenException('No department assigned to your profile');
      }
      if (deptId !== id) {
        throw new ForbiddenException('You are not allowed to view other departments');
      }
    }

    return this.organizationStructureService.getDepartmentById(id);
  }

  @Put('departments/:id')
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update department',
    description: 'Updates an existing department (REQ-OSM-02). BR-36: Direct updates restricted to SYSTEM_ADMIN only for emergency updates. All other users must use change request workflow.',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Direct updates are restricted. Please use change request workflow.' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: Request,
  ) {
    const role = (req as any).user?.role;
    if (role !== Role.SYSTEM_ADMIN) {
      throw new ForbiddenException(
        'Direct updates are restricted to SYSTEM_ADMIN only. Please use the change request workflow to request updates.',
      );
    }
    return this.organizationStructureService.updateDepartment(id, dto);
  }

  // ==================== Position Endpoints ====================

  @Post('positions')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Create a new position',
    description: 'Creates a new position with the provided information (BR-5, BR-10, BR-30)',
  })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async createPosition(@Body() dto: CreatePositionDto, @Req() req: Request) {
    // BR-30: Reporting manager required (top-level positions only allowed for SYSTEM_ADMIN)
    const role = (req as any).user?.role;
    if (!dto.reportsToPositionId && role !== Role.SYSTEM_ADMIN) {
      throw new BadRequestException(
        'Reporting manager (reportsToPositionId) is required. Top-level positions can only be created by SYSTEM_ADMIN.',
      );
    }
    return this.organizationStructureService.createPosition(dto);
  }

  @Get('positions')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get all positions',
    description: 'Retrieves a list of all positions',
  })
  @ApiResponse({ status: 200, description: 'List of positions' })
  async getAllPositions(@Req() req: Request, @Query('departmentId') departmentId?: string) {
    const role = ((req as any).user?.role || '').toLowerCase();
    const isDeptScoped =
      role === Role.DEPARTMENT_HEAD.toLowerCase() ||
      role === Role.DEPARTMENT_EMPLOYEE.toLowerCase();

    if (isDeptScoped) {
      const deptId = await this.getDepartmentIdForUser(req);
      console.log('[DeptHead][Positions][all]', {
        userid: (req as any).user?.userid,
        role: (req as any).user?.role,
        resolvedDeptId: deptId,
        requestedDeptId: departmentId,
      });
      if (!deptId) {
        throw new ForbiddenException('No department assigned to your profile');
      }
      return this.organizationStructureService.getAllPositions(deptId);
    }

    return this.organizationStructureService.getAllPositions(departmentId);
  }

  @Get('positions/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get position by ID',
    description: 'Retrieves a specific position by its ID',
  })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Position found' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async getPositionById(@Param('id') id: string) {
    return this.organizationStructureService.getPositionById(id);
  }

  @Put('positions/:id')
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update position',
    description: 'Updates an existing position (REQ-OSM-02). BR-36: Direct updates restricted to SYSTEM_ADMIN only for emergency updates. All other users must use change request workflow.',
  })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Direct updates are restricted. Please use change request workflow.' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
    @Req() req: Request,
  ) {
    const role = (req as any).user?.role;
    if (role !== Role.SYSTEM_ADMIN) {
      throw new ForbiddenException(
        'Direct updates are restricted to SYSTEM_ADMIN only. Please use the change request workflow to request updates.',
      );
    }
    return this.organizationStructureService.updatePosition(id, dto);
  }

  @Patch('positions/:id/deactivate')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate position',
    description: 'Deactivates a position (REQ-OSM-05, BR-12)',
  })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Position deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async deactivatePosition(@Param('id') id: string) {
    return this.organizationStructureService.deactivatePosition(id);
  }

  @Patch('positions/:id/delimit')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delimit position',
    description: 'Delimits a position with effective end date (REQ-OSM-05, BR-12, BR-37)',
  })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: DelimitPositionDto })
  @ApiResponse({ status: 200, description: 'Position delimited successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async delimitPosition(
    @Param('id') id: string,
    @Body() dto: DelimitPositionDto,
  ) {
    return this.organizationStructureService.delimitPosition(id, dto);
  }

  // ==================== Hierarchy Endpoints ====================

  @Get('hierarchy')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get organizational hierarchy',
    description: 'Gets full organizational hierarchy or subtree for a manager (REQ-SANV-01, REQ-SANV-02). REQ-SANV-02: DEPARTMENT_HEAD automatically sees only their team subtree.',
  })
  @ApiQuery({ name: 'managerId', required: false, description: 'Manager ID to get subtree for' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(@Query() query: GetHierarchyQueryDto, @Req() req: Request) {
    const role = (req as any).user?.role;
    
    // REQ-SANV-02: Auto-filter for DEPARTMENT_HEAD role - managers see only their team
    if (role === Role.DEPARTMENT_HEAD) {
      const managerPositionId = await this.getManagerPositionId(req);
      if (managerPositionId) {
        return this.organizationStructureService.getHierarchy(managerPositionId);
      }
    }
    
    return this.organizationStructureService.getHierarchy(
      query.managerId || query.positionId,
    );
  }

  private async getManagerPositionId(req: Request): Promise<string | null> {
    const payload = (req as any).user;
    if (!payload?.userid) return null;
    
    const user = await this.userModel.findById(payload.userid).lean().exec();
    if (!user?.email) return null;
    
    const profile = await this.employeeProfileModel
      .findOne({ personalEmail: user.email })
      .select('primaryPositionId')
      .lean()
      .exec();
    
    return profile?.primaryPositionId ? profile.primaryPositionId.toString() : null;
  }

  @Get('hierarchy/subtree/:managerId')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary: 'Get subtree for manager',
    description: 'Gets the organizational subtree for a specific manager (REQ-SANV-02)',
  })
  @ApiParam({ name: 'managerId', description: 'Manager position ID' })
  @ApiResponse({ status: 200, description: 'Subtree retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Manager position not found' })
  async getSubtree(@Param('managerId') managerId: string) {
    return this.organizationStructureService.getSubtree(managerId);
  }

  // ==================== Change Request Endpoints (REQ-OSM-03/04, BR-36) ====================

  @Post('change-requests')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Submit change request',
    description: 'Submit a request for structural changes (REQ-OSM-03, BR-36: All changes must be made via workflow approval)',
  })
  @ApiQuery({ name: 'requestedBy', required: true, description: 'Employee ID requesting the change' })
  @ApiBody({ type: SubmitChangeRequestDto })
  @ApiResponse({ status: 201, description: 'Change request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async submitChangeRequest(
    @Body() dto: SubmitChangeRequestDto,
    @Query('requestedBy') requestedBy: string,
  ) {
    return this.organizationStructureService.submitChangeRequest(
      dto,
      requestedBy,
    );
  }

  @Get('change-requests')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  @ApiOperation({
    summary: 'Get all change requests',
    description: 'Retrieves a list of all change requests',
  })
  @ApiResponse({ status: 200, description: 'List of change requests' })
  async getAllChangeRequests() {
    return this.organizationStructureService.getAllChangeRequests();
  }

  @Get('change-requests/:id')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.HR_EMPLOYEE, Role.SYSTEM_ADMIN, Role.DEPARTMENT_HEAD)
  @ApiOperation({
    summary: 'Get change request by ID',
    description: 'Retrieves a specific change request by its ID',
  })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({ status: 200, description: 'Change request found' })
  @ApiResponse({ status: 404, description: 'Change request not found' })
  async getChangeRequestById(@Param('id') id: string) {
    return this.organizationStructureService.getChangeRequestById(id);
  }

  @Post('change-requests/:id/approve')
  @Roles(Role.HR_ADMIN, Role.HR_MANAGER, Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve or reject change request',
    description: 'Approve or reject a change request and apply changes if approved (REQ-OSM-04, BR-36)',
  })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiQuery({ name: 'approverId', required: true, description: 'Employee ID of the approver' })
  @ApiBody({ type: ApproveChangeRequestDto })
  @ApiResponse({ status: 200, description: 'Change request processed successfully' })
  @ApiResponse({ status: 404, description: 'Change request not found' })
  @ApiResponse({ status: 400, description: 'Invalid request status or data' })
  async approveChangeRequest(
    @Param('id') id: string,
    @Body() dto: ApproveChangeRequestDto,
    @Query('approverId') approverId: string,
  ) {
    return this.organizationStructureService.approveChangeRequest(
      id,
      dto,
      approverId,
    );
  }
}
