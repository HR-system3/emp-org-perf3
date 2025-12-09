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

@ApiTags('Organization Structure')
@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
  ) {}

  // ==================== Department Endpoints ====================

  @Post('departments')
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
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Retrieves a list of all departments',
  })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async getAllDepartments() {
    return this.organizationStructureService.getAllDepartments();
  }

  @Get('departments/:id')
  @ApiOperation({
    summary: 'Get department by ID',
    description: 'Retrieves a specific department by its ID',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(@Param('id') id: string) {
    return this.organizationStructureService.getDepartmentById(id);
  }

  @Put('departments/:id')
  @ApiOperation({
    summary: 'Update department',
    description: 'Updates an existing department (REQ-OSM-02)',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.organizationStructureService.updateDepartment(id, dto);
  }

  // ==================== Position Endpoints ====================

  @Post('positions')
  @ApiOperation({
    summary: 'Create a new position',
    description: 'Creates a new position with the provided information (BR-5, BR-10, BR-30)',
  })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async createPosition(@Body() dto: CreatePositionDto) {
    return this.organizationStructureService.createPosition(dto);
  }

  @Get('positions')
  @ApiOperation({
    summary: 'Get all positions',
    description: 'Retrieves a list of all positions',
  })
  @ApiResponse({ status: 200, description: 'List of positions' })
  async getAllPositions() {
    return this.organizationStructureService.getAllPositions();
  }

  @Get('positions/:id')
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
  @ApiOperation({
    summary: 'Update position',
    description: 'Updates an existing position (REQ-OSM-02)',
  })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.organizationStructureService.updatePosition(id, dto);
  }

  @Patch('positions/:id/deactivate')
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
  @ApiOperation({
    summary: 'Get organizational hierarchy',
    description: 'Gets full organizational hierarchy or subtree for a manager (REQ-SANV-01, REQ-SANV-02)',
  })
  @ApiQuery({ name: 'managerId', required: false, description: 'Manager ID to get subtree for' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(@Query() query: GetHierarchyQueryDto) {
    return this.organizationStructureService.getHierarchy(
      query.managerId || query.positionId,
    );
  }

  @Get('hierarchy/subtree/:managerId')
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
  @ApiOperation({
    summary: 'Get all change requests',
    description: 'Retrieves a list of all change requests',
  })
  @ApiResponse({ status: 200, description: 'List of change requests' })
  async getAllChangeRequests() {
    return this.organizationStructureService.getAllChangeRequests();
  }

  @Get('change-requests/:id')
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
