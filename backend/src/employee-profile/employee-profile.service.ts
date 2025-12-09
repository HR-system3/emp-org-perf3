// ./src/employee-profile/employee-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

  async createEmployeeProfile(
    dto: CreateEmployeeProfileDto,
  ): Promise<EmployeeProfile> {
    const doc = new this.employeeProfileModel({
      // ⚠️ IMPORTANT: dto has `employeeCode`, not `employeeNumber`
      employeeNumber: dto.employeeNumber,
      dateOfHire: dto.dateOfHire,

      // Base user fields – these live on UserProfileBase
      firstName: dto.firstName,
      lastName: dto.lastName,
      nationalId: dto.nationalId,
      personalEmail: dto.email,
      mobilePhone: dto.phone,
      dateOfBirth: dto.dateOfBirth,

      contractType: dto.contractType,
      status: dto.status ?? EmployeeStatus.ACTIVE,

      // Payroll link
      payGradeId: dto.payGradeId,
      // Org-structure links will be wired later (once you have IDs)
    });

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
    return this.employeeProfileModel
      .findOne({ employeeNumber })
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
}