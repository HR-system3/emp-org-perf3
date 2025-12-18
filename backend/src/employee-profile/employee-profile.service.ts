// ./src/employee-profile/employee-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FilterQuery } from 'mongoose';

import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleDocument,
} from './models/employee-system-role.schema';
import {
  EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestDocument,
} from './models/ep-change-request.schema';

import {
  ProfileChangeStatus,
  EmployeeStatus,
} from './enums/employee-profile.enums';

import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { SelfServiceUpdateProfileDto } from './dto/self-service-update-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import {
  Position,
  PositionDocument,
} from '../organization-structure/models/position.schema';
import {
  Department,
  DepartmentDocument,
} from '../organization-structure/models/department.schema';
import { AssignPositionDepartmentDto } from './dto/assign-position-department.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,

    @InjectModel(EmployeeSystemRole.name)
    private readonly employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,

    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequestDocument>,

    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,

    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Normalize a value that may come in as:
   * - A valid ObjectId
   * - A plain 24-char hex string
   * - A string like ObjectId("...") from legacy data
   * Returns a clean hex string or null if invalid.
   */
  private normalizeObjectId(value?: unknown): string | null {
    if (!value) return null;
    const str = String(value).trim();

    // Handle strings like ObjectId("abcdef...") or ObjectId('abcdef...')
    const match = str.match(/ObjectId\(["']?([0-9a-fA-F]{24})["']?\)/);
    const candidate = match ? match[1] : str;

    return Types.ObjectId.isValid(candidate) ? candidate : null;
  }

  // ---------------------------------------------------------------------------
  // EMPLOYEE PROFILE CRUD
  // ---------------------------------------------------------------------------

  // employee-profile.service.ts

async createEmployeeProfile(
  dto: CreateEmployeeProfileDto,
): Promise<EmployeeProfile> {
  // Validate required fields
  if (!dto.employeeNumber || !dto.employeeNumber.trim()) {
    throw new Error('Employee number is required');
  }
  if (!dto.firstName || !dto.firstName.trim()) {
    throw new Error('First name is required');
  }
  if (!dto.lastName || !dto.lastName.trim()) {
    throw new Error('Last name is required');
  }
  if (!dto.nationalId || !dto.nationalId.trim()) {
    throw new Error('National ID is required');
  }
  if (!dto.email || !dto.email.trim()) {
    throw new Error('Email is required');
  }
  if (!dto.phone || !dto.phone.trim()) {
    throw new Error('Phone is required');
  }
  if (!dto.dateOfBirth) {
    throw new Error('Date of birth is required');
  }
  if (!dto.dateOfHire) {
    throw new Error('Date of hire is required');
  }
  if (!dto.contractType) {
    throw new Error('Contract type is required');
  }

  // Convert date strings to Date objects if needed
  const dateOfBirth = dto.dateOfBirth instanceof Date 
    ? dto.dateOfBirth 
    : new Date(dto.dateOfBirth);
  
  const dateOfHire = dto.dateOfHire instanceof Date 
    ? dto.dateOfHire 
    : new Date(dto.dateOfHire);

  // Validate dates
  if (isNaN(dateOfBirth.getTime())) {
    throw new Error('Invalid date of birth');
  }
  if (isNaN(dateOfHire.getTime())) {
    throw new Error('Invalid date of hire');
  }

  const docData: any = {
    // Normalize employee number to avoid leading/trailing spaces
    employeeNumber: dto.employeeNumber.trim(),
    dateOfHire: dateOfHire,

    // Base user fields – these live on UserProfileBase
    firstName: dto.firstName.trim(),
    lastName: dto.lastName.trim(),
    nationalId: dto.nationalId.trim(),
    personalEmail: dto.email.trim(),
    mobilePhone: dto.phone.trim(),
    dateOfBirth: dateOfBirth,

    contractType: dto.contractType,
    status: dto.status ?? EmployeeStatus.ACTIVE,
  };

  // Add optional fields if provided
  if (dto.gender) {
    docData.gender = dto.gender;
  }
  if (dto.maritalStatus) {
    docData.maritalStatus = dto.maritalStatus;
  }

  // Only set payGradeId if a non-empty string was provided and it's a valid ObjectId
  if (dto.payGradeId && dto.payGradeId.trim() !== '' && dto.payGradeId.trim() !== 'optional') {
    try {
      // Validate it's a valid MongoDB ObjectId format
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(dto.payGradeId.trim())) {
        docData.payGradeId = dto.payGradeId.trim();
      }
    } catch (error) {
      // If payGradeId is invalid, just skip it
      console.warn('Invalid payGradeId provided, skipping:', dto.payGradeId);
    }
  }

  const doc = new this.employeeProfileModel(docData);
  return doc.save();
}


  async getById(id: string): Promise<EmployeeProfile | null> {
    return this.employeeProfileModel
      .findById(id)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .populate('lastAppraisalRecordId')
      .populate('lastAppraisalCycleId')
      .populate('lastAppraisalTemplateId')
      .exec();
  }

  async getByEmployeeNumber(
    employeeNumber: string,
  ): Promise<EmployeeProfile | null> {
    const normalized = employeeNumber.trim();
  
    return this.employeeProfileModel
      .findOne({ employeeNumber: normalized })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('payGradeId')
      .populate('lastAppraisalRecordId')
      .populate('lastAppraisalCycleId')
      .populate('lastAppraisalTemplateId')
      .exec();
  }

  async getByEmail(email: string): Promise<EmployeeProfile | null> {
    if (!email || typeof email !== 'string') {
      console.error('[getByEmail] Invalid email provided');
      return null;
    }
    
    try {
      const normalized = email.trim().toLowerCase();
      console.log('[getByEmail] Searching for email:', normalized);
      
      // Use simple case-insensitive regex - most reliable approach
      const profile = await this.employeeProfileModel
        .findOne({ 
          personalEmail: { 
            $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
          } 
        })
        .lean()
        .exec();
      
      if (profile) {
        console.log('[getByEmail] Profile found, ID:', (profile as any)._id);
      } else {
        console.log('[getByEmail] No profile found');
      }
      
      return profile as EmployeeProfile | null;
    } catch (error: any) {
      console.error('[getByEmail] EXCEPTION:', error);
      console.error('[getByEmail] Error type:', error?.constructor?.name);
      console.error('[getByEmail] Error message:', error?.message);
      if (error?.stack) {
        console.error('[getByEmail] Stack:', error.stack.substring(0, 500));
      }
      // Return null instead of throwing
      return null;
    }
  }
  
  /**
   * List employee profiles for directory views.
   * - Supports optional department filter.
   * - Avoids populate to prevent cast errors from legacy/invalid ObjectId strings.
   */
  async listEmployees(departmentId?: string): Promise<Partial<EmployeeProfile>[]> {
    const filter: FilterQuery<EmployeeProfile> = {};

    const normalizedDeptId = this.normalizeObjectId(departmentId);
    if (normalizedDeptId) {
      filter.primaryDepartmentId = normalizedDeptId as any;
    }

    const employees = await this.employeeProfileModel
      .find(filter)
      .select(
        'firstName lastName employeeNumber personalEmail mobilePhone status primaryPositionId primaryDepartmentId isActive',
      )
      .lean()
      .exec();

    // Sanitize any legacy ObjectId("...") strings on reference fields
    return employees.map((emp: any) => {
      const cleaned = { ...emp };
      const primaryPositionId = this.normalizeObjectId(emp.primaryPositionId);
      const primaryDepartmentId = this.normalizeObjectId(emp.primaryDepartmentId);
      if (primaryPositionId) cleaned.primaryPositionId = primaryPositionId;
      if (primaryDepartmentId) cleaned.primaryDepartmentId = primaryDepartmentId;
      return cleaned;
    });
  }


  async updateEmployeeProfile(
    id: string,
    dto: UpdateEmployeeProfileDto,
  ): Promise<EmployeeProfile> {
    // Security: Filter out assignment fields - these can only be set via assignPositionDepartment endpoint
    const restrictedFields = ['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId'];
    const hasRestrictedFields = restrictedFields.some(field => (dto as any)[field] !== undefined);
    
    if (hasRestrictedFields) {
      throw new BadRequestException(
        'Position and department assignments cannot be updated through this endpoint. Please use PATCH /employee-profile/:id/assign-position-department endpoint (HR Admin/HR Manager only).'
      );
    }

    // Only allow safe fields to be updated
    const safeFields: any = {};
    if (dto.firstName !== undefined) safeFields.firstName = dto.firstName;
    if (dto.lastName !== undefined) safeFields.lastName = dto.lastName;
    if (dto.nationalId !== undefined) safeFields.nationalId = dto.nationalId;
    if (dto.email !== undefined) safeFields.personalEmail = dto.email;
    if (dto.phone !== undefined) safeFields.mobilePhone = dto.phone;
    if (dto.dateOfBirth !== undefined) safeFields.dateOfBirth = dto.dateOfBirth;
    if (dto.dateOfHire !== undefined) safeFields.dateOfHire = dto.dateOfHire;
    if (dto.contractType !== undefined) safeFields.contractType = dto.contractType;
    if (dto.payGradeId !== undefined) safeFields.payGradeId = dto.payGradeId;
    if (dto.gender !== undefined) safeFields.gender = dto.gender;
    if (dto.maritalStatus !== undefined) safeFields.maritalStatus = dto.maritalStatus;
    if (dto.status !== undefined) safeFields.status = dto.status;

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(id, { $set: safeFields }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee profile not found');
    }

    return updated;
  }

  /**
   * Assign position and department to an employee profile
   * 
   * This method can only be called by HR Admin, HR Manager, or System Admin.
   * It validates:
   * - Position exists and is active
   * - Department exists and is active
   * - Position belongs to the specified department
   * - No circular reporting (if supervisorPositionId provided)
   */
  async assignPositionDepartment(
    id: string,
    dto: AssignPositionDepartmentDto,
  ): Promise<EmployeeProfile> {
    // Validate employee profile exists
    const profile = await this.employeeProfileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    // Validate position exists and is active
    const position = await this.positionModel.findById(dto.primaryPositionId).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${dto.primaryPositionId} not found`);
    }
    if (!position.isActive) {
      throw new BadRequestException(`Position ${position.positionId} is not active`);
    }

    // Validate department exists and is active
    const department = await this.departmentModel.findById(dto.primaryDepartmentId).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${dto.primaryDepartmentId} not found`);
    }
    if (!department.isActive) {
      throw new BadRequestException(`Department ${department.deptId} is not active`);
    }

    // Validate position belongs to department
    const positionDeptId = position.departmentId?.toString();
    const requestedDeptId = dto.primaryDepartmentId;
    if (positionDeptId !== requestedDeptId) {
      throw new BadRequestException(
        `Position ${position.positionId} (${position.title}) does not belong to department ${department.deptId} (${department.name}). Position belongs to a different department.`
      );
    }

    // Validate supervisor position if provided
    if (dto.supervisorPositionId) {
      const supervisorPosition = await this.positionModel.findById(dto.supervisorPositionId).exec();
      if (!supervisorPosition) {
        throw new NotFoundException(`Supervisor position with ID ${dto.supervisorPositionId} not found`);
      }
      if (!supervisorPosition.isActive) {
        throw new BadRequestException(`Supervisor position ${supervisorPosition.positionId} is not active`);
      }

      // Check for circular reporting
      const isCircular = await this.checkCircularReporting(
        dto.primaryPositionId,
        dto.supervisorPositionId,
      );
      if (isCircular) {
        throw new BadRequestException(
          'Circular reporting line detected. The supervisor position cannot report to the assigned position.'
        );
      }
    }

    // Update employee profile with assignments
    const update: any = {
      primaryPositionId: new Types.ObjectId(dto.primaryPositionId),
      primaryDepartmentId: new Types.ObjectId(dto.primaryDepartmentId),
    };

    if (dto.supervisorPositionId) {
      update.supervisorPositionId = new Types.ObjectId(dto.supervisorPositionId);
    }

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('supervisorPositionId')
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee profile not found');
    }

    return updated;
  }

  /**
   * Check for circular reporting in position hierarchy
   * Helper method for assignment validation
   */
  private async checkCircularReporting(
    positionId: string,
    reportsToId: string,
  ): Promise<boolean> {
    if (positionId === reportsToId) {
      return true; // Self-reference is circular
    }

    // Check if the target position reports to the current position (direct circular)
    const targetPosition = await this.positionModel.findById(reportsToId).exec();
    if (!targetPosition) {
      return false; // Target doesn't exist, can't be circular
    }

    // Check if target position reports to current position
    if (targetPosition.reportsToPositionId?.toString() === positionId) {
      return true; // Direct circular reference
    }

    // Check indirect circular references by traversing up the chain
    const visited = new Set<string>();
    let currentId: string | undefined = reportsToId;

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // Loop detected
      }
      if (currentId === positionId) {
        return true; // Circular reference found
      }
      visited.add(currentId);

      const current = await this.positionModel.findById(currentId).exec();
      currentId = current?.reportsToPositionId?.toString();
    }

    return false;
  }

  /**
   * Soft-deactivate an employee profile.
   * - Sets isActive = false and status = INACTIVE
   * - Records deactivatedAt, deactivationReason, deactivatedByEmployeeId
   */
  async deactivateEmployeeProfile(
    id: string,
    reason?: string,
    performedByEmployeeId?: string,
  ): Promise<EmployeeProfile> {
    const profile = await this.employeeProfileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const update: any = {
      isActive: false,
      status: EmployeeStatus.INACTIVE,
      statusEffectiveFrom: new Date(),
      deactivatedAt: new Date(),
    };

    if (reason) {
      update.deactivationReason = reason;
    }

    if (performedByEmployeeId && Types.ObjectId.isValid(performedByEmployeeId)) {
      update.deactivatedByEmployeeId = new Types.ObjectId(performedByEmployeeId);
    }

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee profile not found');
    }

    return updated;
  }

  // ---------------------------------------------------------------------------
  // SELF-SERVICE (Employee) – US-E2-04, US-E2-05, US-E2-12
  // ---------------------------------------------------------------------------

  async getSelfProfile(id: string): Promise<EmployeeProfile> {
    // Check if id is a valid MongoDB ObjectId
    const isObjectId = Types.ObjectId.isValid(id) && id.length === 24;
    
    let profile: EmployeeProfile | null;
    
    if (isObjectId) {
      // Try MongoDB ID first
      profile = await this.getById(id);
      if (!profile) {
        // If not found by ID, it might be a User ID, so try to find by email
        // We'll need to get the user's email first - but we don't have access to User service here
        // So we'll skip this for now and let the error be thrown
      }
    } else {
      // Try employee number first
      profile = await this.getByEmployeeNumber(id);
      
      // If not found by employee number, try email
      if (!profile && id.includes('@')) {
        profile = await this.getByEmail(id);
      }
    }
    
    if (!profile) {
      throw new NotFoundException(
        'Employee profile not found. Please use your Employee Profile MongoDB _id, Employee Number (EMP), or email address.'
      );
    }
    return profile;
  }

  async updateSelfServiceProfile(
    id: string,
    dto: SelfServiceUpdateProfileDto,
  ): Promise<EmployeeProfile> {
    const update: any = {};

    if (dto.personalEmail !== undefined) update.personalEmail = dto.personalEmail;
    if (dto.mobilePhone !== undefined) update.mobilePhone = dto.mobilePhone;
    if (dto.homePhone !== undefined) update.homePhone = dto.homePhone;
    if (dto.biography !== undefined) update.biography = dto.biography;
    if (dto.profilePictureUrl !== undefined) {
      update.profilePictureUrl = dto.profilePictureUrl;
    }
    if (dto.address !== undefined) update.address = dto.address;

    // Check if id is a valid MongoDB ObjectId
    const isObjectId = Types.ObjectId.isValid(id) && id.length === 24;
    
    let updated: EmployeeProfile | null;
    
    if (isObjectId) {
      // Update by MongoDB ID
      updated = await this.employeeProfileModel
        .findByIdAndUpdate(id, { $set: update }, { new: true })
        .exec();
    } else if (id.includes('@')) {
      // Update by email
      updated = await this.employeeProfileModel
        .findOneAndUpdate(
          { personalEmail: { $regex: new RegExp(`^${id.trim()}$`, 'i') } },
          { $set: update },
          { new: true }
        )
        .exec();
    } else {
      // Update by employee number
      updated = await this.employeeProfileModel
        .findOneAndUpdate(
          { employeeNumber: id.trim() },
          { $set: update },
          { new: true }
        )
        .exec();
    }

    if (!updated) {
      throw new NotFoundException(
        'Employee profile not found. Please use your Employee Profile MongoDB _id, Employee Number (EMP), or email address.'
      );
    }

    return updated;
  }

  // ---------------------------------------------------------------------------
  // MANAGER VIEW – Team Brief (US-E4-01, US-E4-02, BR 41b)
  // ---------------------------------------------------------------------------

  async getTeamBrief(managerEmployeeId: string): Promise<EmployeeProfile[]> {
    const manager = await this.employeeProfileModel
      .findById(managerEmployeeId)
      .exec();

    if (!manager || !manager.primaryPositionId) {
      return [];
    }

    return this.employeeProfileModel
      .find({ supervisorPositionId: manager.primaryPositionId })
      .select(
        'firstName lastName employeeNumber dateOfHire status primaryPositionId primaryDepartmentId',
      )
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .exec();
  }

  /**
   * Get team members using position reporting structure.
   * Finds all employees whose positions report (directly or indirectly) to the manager's position.
   */
  async getTeamByReportingStructure(
    managerEmployeeId: string,
  ): Promise<EmployeeProfile[]> {
    // Get the manager's employee profile
    const manager = await this.employeeProfileModel
      .findById(managerEmployeeId)
      .exec();

    if (!manager || !manager.primaryPositionId) {
      return [];
    }

    const managerPositionId = manager.primaryPositionId;

    // Get all active positions
    const allPositions = await this.positionModel
      .find({ isActive: true })
      .exec();

    // Recursively find all positions that report to the manager's position
    const findReportingPositions = (
      positionId: Types.ObjectId,
      visited: Set<string> = new Set(),
    ): Types.ObjectId[] => {
      const positionIdStr = positionId.toString();
      if (visited.has(positionIdStr)) {
        return []; // Avoid cycles
      }
      visited.add(positionIdStr);

      const reportingPositions: Types.ObjectId[] = [];

      // Find all positions that directly report to this position
      for (const pos of allPositions) {
        if (
          pos.reportsToPositionId &&
          pos.reportsToPositionId.toString() === positionIdStr
        ) {
          reportingPositions.push(pos._id);
          // Recursively find positions reporting to this one
          reportingPositions.push(
            ...findReportingPositions(pos._id, visited),
          );
        }
      }

      return reportingPositions;
    };

    // Get all position IDs that report to the manager's position
    const reportingPositionIds = findReportingPositions(managerPositionId);

    if (reportingPositionIds.length === 0) {
      return [];
    }

    // Find all employees whose primaryPositionId is in the reporting chain
    // Include employees where isActive is true or undefined (defaults to true)
    return this.employeeProfileModel
      .find({
        primaryPositionId: { $in: reportingPositionIds },
        $or: [
          { isActive: true },
          { isActive: { $exists: false } }, // Handle documents created before isActive was added
        ],
      })
      .select(
        'firstName lastName employeeNumber dateOfHire status primaryPositionId primaryDepartmentId isActive',
      )
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .exec();
  }

  /**
   * Get direct reports for a department head (or any manager) based on:
   * - supervisorPositionId matching the head's primaryPositionId
   * - OR employee primaryPositionId belongs to a position that reports to head's position
   * Filters to the same primaryDepartmentId as the head.
   */
  async getReportsForHead(employeeProfileId: string): Promise<EmployeeProfile[]> {
    const head = await this.employeeProfileModel.findById(employeeProfileId).lean();
    if (!head?.primaryPositionId) {
      return [];
    }
    const headPosId = head.primaryPositionId.toString();
    const headDeptId = head.primaryDepartmentId?.toString();

    // Positions that report to head's position
    const reportingPositions = await this.positionModel
      .find({ reportsToPositionId: head.primaryPositionId })
      .select('_id')
      .lean();
    const reportingPosIds = reportingPositions.map((p) => p._id.toString());

    const filter: any = {
      $or: [
        { supervisorPositionId: headPosId },
        { primaryPositionId: { $in: reportingPosIds } },
      ],
      status: EmployeeStatus.ACTIVE,
    };
    if (headDeptId) {
      filter.primaryDepartmentId = headDeptId;
    }

    return this.employeeProfileModel
      .find(filter)
      .select(
        'firstName lastName employeeNumber status primaryPositionId primaryDepartmentId',
      )
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .exec();
  }

  // ---------------------------------------------------------------------------
  // CHANGE REQUESTS – Workflow (Employee + HR) – US-E6-02, US-E2-03
  // ---------------------------------------------------------------------------

  async createChangeRequest(
    employeeProfileId: string,
    dto: CreateChangeRequestDto,
  ): Promise<EmployeeProfileChangeRequest> {
    const requestId = `ECR-${Date.now()}`;

    const doc = new this.changeRequestModel({
      requestId,
      employeeProfileId,
      requestDescription: dto.reason ?? 'Profile change request',
      requestedChanges: dto.requestedChanges,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });

    return doc.save();
  }

  async listChangeRequests(
    status?: ProfileChangeStatus,
  ): Promise<EmployeeProfileChangeRequest[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.changeRequestModel.find(filter).exec();
  }

  async processChangeRequest(
    requestId: string,
    dto: ProcessChangeRequestDto,
  ): Promise<EmployeeProfileChangeRequest> {
    const changeRequest = await this.changeRequestModel
      .findOne({ requestId })
      .exec();

    if (!changeRequest) {
      throw new NotFoundException('Change request not found');
    }

    changeRequest.status = dto.status;
    changeRequest.processedAt = new Date();
    await changeRequest.save();

    // If APPROVED, apply payload directly to EmployeeProfile
    if (
      dto.status === ProfileChangeStatus.APPROVED &&
      dto.appliedChanges &&
      Object.keys(dto.appliedChanges).length > 0
    ) {
      await this.employeeProfileModel
        .findByIdAndUpdate(changeRequest.employeeProfileId, {
          $set: dto.appliedChanges,
        })
        .exec();
    }

    return changeRequest;
  }

  // ---------------------------------------------------------------------------
  // SYSTEM ROLES – HR Admin / SysAdmin (US-E7-05)
  // ---------------------------------------------------------------------------

  async assignRoles(
    employeeProfileId: string,
    dto: AssignRoleDto,
  ): Promise<EmployeeSystemRole> {
    let accessProfile = await this.employeeSystemRoleModel
      .findOne({ employeeProfileId })
      .exec();

    if (accessProfile) {
      accessProfile.roles = dto.roles;
    } else {
      accessProfile = new this.employeeSystemRoleModel({
        employeeProfileId,
        roles: dto.roles,
      });
    }

    return accessProfile.save();
  }

  async findAll(search?: string, departmentId?: string) {
    const filter: FilterQuery<EmployeeProfileDocument> = {};
  
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i'); // case-insensitive
  
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { employeeNumber: regex },
        { status: regex },
      ];
    }

    if (departmentId && departmentId.trim()) {
      // If departmentId looks like a Mongo ObjectId, use it directly
      const trimmed = departmentId.trim();
      if (Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
        filter.primaryDepartmentId = new Types.ObjectId(trimmed);
      }
    }
  
    return this.employeeProfileModel
      .find(filter)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .sort({ createdAt: -1 })
      .limit(200)
      .exec();
  }
}