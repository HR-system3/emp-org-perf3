// ./src/employee-profile/employee-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,

    @InjectModel(EmployeeSystemRole.name)
    private readonly employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,

    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequestDocument>,
  ) {}

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
  

  async updateEmployeeProfile(
    id: string,
    dto: UpdateEmployeeProfileDto,
  ): Promise<EmployeeProfile> {
    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
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
    const profile = await this.getById(id);
    if (!profile) {
      throw new NotFoundException('Employee profile not found');
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

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee profile not found');
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

  async findAll(search?: string) {
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
  
    return this.employeeProfileModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .exec();
  }
}