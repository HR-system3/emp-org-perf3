import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Department,
  DepartmentDocument,
} from './models/department.schema';
import {
  Position,
  PositionDocument,
} from './models/position.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from './models/position-assignment.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from './models/structure-change-request.schema';
import {
  StructureChangeLog,
  StructureChangeLogDocument,
} from './models/structure-change-log.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { DelimitPositionDto } from './dto/delimit-position.dto';
import { SubmitChangeRequestDto } from './dto/submit-change-request.dto';
import { ApproveChangeRequestDto } from './dto/approve-change-request.dto';
import { HierarchyBuilder } from './utils/hierarchy-builder';
import { PayrollStub, EmployeeProfileStub } from './utils/integration-stubs';
import {
  StructureRequestStatus,
  StructureRequestType,
  ApprovalDecision,
  ChangeLogAction,
  PositionStatus,
} from './enums/organization-structure.enums';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(PositionAssignment.name)
    private positionAssignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(StructureChangeRequest.name)
    private changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(StructureChangeLog.name)
    private changeLogModel: Model<StructureChangeLogDocument>,
    private payrollStub: PayrollStub,
    private employeeProfileStub: EmployeeProfileStub,
  ) {}

  // ==================== Audit Logging (BR-22) ====================
  // ==================== Audit Logging (BR-22) ====================
private async createAuditLog(
  action: ChangeLogAction,
  entityType: string,
  entityId: Types.ObjectId,
  performedByEmployeeId?: Types.ObjectId | string,
  beforeSnapshot?: Record<string, unknown>,
  afterSnapshot?: Record<string, unknown>,
  summary?: string,
): Promise<void> {
  try {
    const doc: any = {
      action,
      entityType,
      entityId,
      beforeSnapshot: beforeSnapshot ?? undefined,
      afterSnapshot: afterSnapshot ?? undefined,
      summary: summary ?? undefined,
    };

    // Safely add performedByEmployeeId only if valid
    if (performedByEmployeeId) {
      const strId = performedByEmployeeId instanceof Types.ObjectId
        ? performedByEmployeeId.toString()
        : String(performedByEmployeeId);

      if (Types.ObjectId.isValid(strId)) {
        doc.performedByEmployeeId = new Types.ObjectId(strId);
      } else {
        // invalid id — don't include it, but warn in logs
        console.warn(`createAuditLog: ignored invalid performedByEmployeeId: ${performedByEmployeeId}`);
      }
    }

    await this.changeLogModel.create(doc);
  } catch (err) {
    // IMPORTANT: do NOT rethrow — audit failures must not break the main transaction.
    // Log the error for ops debugging and move on.
    // Optionally we could push this to a fallback queue or file for later investigation.
    // Keep the log concise but informative:
    console.error('Audit log creation failed:', {
      action,
      entityType,
      entityId: entityId?.toString?.(),
      error: err?.message ?? err,
    });
  }
}


  // ==================== Circular Reporting Prevention (REQ-OSM-09) ====================
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

  // ==================== Department Methods ====================

  private async generateDeptId(): Promise<string> {
    // Try simple readable ids like DEPT-<6digits> and ensure uniqueness
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `DEPT-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`; // e.g. DEPT-12345678
      const exists = await this.departmentModel.findOne({ deptId: candidate }).lean().exec();
      if (!exists) return candidate;
      // else loop and try again
    }
    // fallback: use ObjectId string if all attempts collide (extremely unlikely)
    return `DEPT-${new Types.ObjectId().toString()}`;
  }
  
  async createDepartment(
    dto: CreateDepartmentDto,
    requestedBy?: string,
  ): Promise<DepartmentDocument> {
    // If client didn't supply deptId -> generate one
    if (!dto.deptId) {
      dto.deptId = await this.generateDeptId();
    }
  
    // BR-5: Check unique deptId
    const existingDept = await this.departmentModel
      .findOne({ deptId: dto.deptId })
      .exec();
    if (existingDept) {
      throw new ConflictException(
        `Department with deptId ${dto.deptId} already exists`,
      );
    }
  
    // BR-30: Validate costCenter is provided
    if (!dto.costCenter) {
      throw new BadRequestException('Cost center is required (BR-30)');
    }
  
    const department = new this.departmentModel({
      deptId: dto.deptId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      costCenter: dto.costCenter,
      isActive: true,
    });
    if (dto.headPositionId) {
      department.headPositionId = new Types.ObjectId(dto.headPositionId);
    }
  
    const saved = await department.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.CREATED,
      'Department',
      saved._id,
      requestedBy && Types.ObjectId.isValid(requestedBy)
        ? new Types.ObjectId(requestedBy)
        : undefined,
      undefined,
      saved.toObject() as unknown as Record<string, unknown>,
      `Department ${dto.deptId} created`,
    );

    return saved;
  }

  async getAllDepartments(): Promise<DepartmentDocument[]> {
    return this.departmentModel.find().exec();
  }

  async getDepartmentById(id: string): Promise<DepartmentDocument> {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
    requestedBy?: string,
  ): Promise<DepartmentDocument> {
    // BR-36: All updates must go through change request workflow
    // For now, we'll allow direct updates but log them
    // In production, this should create a change request instead

    const department = await this.getDepartmentById(id);
    const beforeSnapshot = department.toObject();

    if (dto.code) department.code = dto.code;
    if (dto.name) department.name = dto.name;
    if (dto.description !== undefined) department.description = dto.description;
    if (dto.headPositionId) {
      department.headPositionId = new Types.ObjectId(dto.headPositionId);
    }
    if (dto.costCenter) department.costCenter = dto.costCenter;
    if (dto.isActive !== undefined) department.isActive = dto.isActive;

    const saved = await department.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.UPDATED,
      'Department',
      saved._id,
      requestedBy,
      beforeSnapshot as unknown as Record<string, unknown>,
      saved.toObject() as unknown as Record<string, unknown>,
      `Department ${department.deptId} updated`,
    );

    return saved;
  }

  // ==================== Position Methods ====================

  async createPosition(
    dto: CreatePositionDto,
    requestedBy?: string,
  ): Promise<PositionDocument> {
    // BR-5: Check unique positionId
    const existingPos = await this.positionModel
      .findOne({ positionId: dto.positionId })
      .exec();
    if (existingPos) {
      throw new ConflictException(
        `Position with positionId ${dto.positionId} already exists`,
      );
    }

    // BR-10: Validate Position has JobKey, PayGrade, Dept ID
    if (!dto.jobKey) {
      throw new BadRequestException('Job key is required (BR-10)');
    }
    if (!dto.payGradeId) {
      throw new BadRequestException('Pay grade ID is required (BR-10)');
    }
    if (!dto.departmentId) {
      throw new BadRequestException('Department ID is required (BR-10)');
    }

    // BR-10: Validate payGradeId exists in Payroll module
    const payGradeValid = await this.payrollStub.validatePayGrade(
      dto.payGradeId,
    );
    if (!payGradeValid) {
      throw new BadRequestException(
        `Pay grade ${dto.payGradeId} does not exist in Payroll module`,
      );
    }

    // BR-30: Validate costCenter is provided
    if (!dto.costCenter) {
      throw new BadRequestException('Cost center is required (BR-30)');
    }

    // REQ-OSM-09: Check for circular reporting
    if (dto.reportsToPositionId) {
      const isCircular = await this.checkCircularReporting(
        dto.positionId, // Use positionId for checking (will be created)
        dto.reportsToPositionId,
      );
      if (isCircular) {
        throw new BadRequestException(
          'Circular reporting line detected (REQ-OSM-09)',
        );
      }
    }

    const position = new this.positionModel({
      positionId: dto.positionId,
      code: dto.code,
      title: dto.title,
      description: dto.description,
      jobKey: dto.jobKey,
      departmentId: new Types.ObjectId(dto.departmentId),
      payGradeId: new Types.ObjectId(dto.payGradeId),
      reportsToPositionId: dto.reportsToPositionId
        ? new Types.ObjectId(dto.reportsToPositionId)
        : undefined,
      status: dto.status || PositionStatus.VACANT,
      costCenter: dto.costCenter,
      isActive: true,
    });

    const saved = await position.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.CREATED,
      'Position',
      saved._id,
      requestedBy,
      undefined,
      saved.toObject() as unknown as Record<string, unknown>,
      `Position ${dto.positionId} created`,
    );

    return saved;
  }

  async getAllPositions(): Promise<PositionDocument[]> {
    return this.positionModel.find().exec();
  }

  async getPositionById(id: string): Promise<PositionDocument> {
    const position = await this.positionModel.findById(id).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return position;
  }

  async updatePosition(
    id: string,
    dto: UpdatePositionDto,
    requestedBy?: string,
  ): Promise<PositionDocument> {
    // BR-36: All updates must go through change request workflow
    // For now, we'll allow direct updates but log them
    // In production, this should create a change request instead

    const position = await this.getPositionById(id);
    const beforeSnapshot = position.toObject();

    // REQ-OSM-09: Check for circular reporting if reportsToPositionId is being updated
    if (dto.reportsToPositionId !== undefined) {
      const newReportsTo = dto.reportsToPositionId;
      if (newReportsTo) {
        const isCircular = await this.checkCircularReporting(
          id,
          newReportsTo,
        );
        if (isCircular) {
          throw new BadRequestException(
            'Circular reporting line detected (REQ-OSM-09)',
          );
        }
      }
    }

    if (dto.code) position.code = dto.code;
    if (dto.title) position.title = dto.title;
    if (dto.description !== undefined) position.description = dto.description;
    if (dto.jobKey) position.jobKey = dto.jobKey;
    if (dto.departmentId) {
      position.departmentId = new Types.ObjectId(dto.departmentId);
    }
    if (dto.payGradeId) {
      // BR-10: Validate payGradeId exists
      const payGradeValid = await this.payrollStub.validatePayGrade(
        dto.payGradeId,
      );
      if (!payGradeValid) {
        throw new BadRequestException(
          `Pay grade ${dto.payGradeId} does not exist in Payroll module`,
        );
      }
      position.payGradeId = new Types.ObjectId(dto.payGradeId);
    }
    if (dto.reportsToPositionId !== undefined) {
      position.reportsToPositionId = dto.reportsToPositionId
        ? new Types.ObjectId(dto.reportsToPositionId)
        : undefined;
    }
    if (dto.status) position.status = dto.status;
    if (dto.costCenter) position.costCenter = dto.costCenter;
    if (dto.isActive !== undefined) position.isActive = dto.isActive;

    const saved = await position.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.UPDATED,
      'Position',
      saved._id,
      requestedBy,
      beforeSnapshot as unknown as Record<string, unknown>,
      saved.toObject() as unknown as Record<string, unknown>,
      `Position ${position.positionId} updated`,
    );

    return saved;
  }

  async deactivatePosition(
    id: string,
    requestedBy?: string,
  ): Promise<PositionDocument> {
    const position = await this.getPositionById(id);
    const beforeSnapshot = position.toObject();

    position.isActive = false;
    position.status = PositionStatus.INACTIVE;

    const saved = await position.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.DEACTIVATED,
      'Position',
      saved._id,
      requestedBy,
      beforeSnapshot as unknown as Record<string, unknown>,
      saved.toObject() as unknown as Record<string, unknown>,
      `Position ${position.positionId} deactivated`,
    );

    return saved;
  }

  async delimitPosition(
    id: string,
    dto: DelimitPositionDto,
    requestedBy?: string,
  ): Promise<PositionDocument> {
    // BR-12: Check for historical assignments before delimiting
    const assignments = await this.positionAssignmentModel
      .find({ positionId: new Types.ObjectId(id) })
      .exec();

    if (assignments.length > 0) {
      // BR-12: Positions with history cannot be deleted, only delimited
      // This is fine - we're delimiting, not deleting
    }

    const position = await this.getPositionById(id);
    const beforeSnapshot = position.toObject();

    // BR-37: Set effectiveEnd date for historical preservation
    position.isActive = false;
    position.status = PositionStatus.DELIMITED;
    position.effectiveEnd = new Date(dto.effectiveEnd);

    const saved = await position.save();

    // BR-22: Audit log
    await this.createAuditLog(
      ChangeLogAction.DEACTIVATED,
      'Position',
      saved._id,
      requestedBy,
      beforeSnapshot as unknown as Record<string, unknown>,
      saved.toObject() as unknown as Record<string, unknown>,
      `Position ${position.positionId} delimited: ${dto.reason}`,
    );

    return saved;
  }

  // ==================== Change Request Workflow (REQ-OSM-03/04, BR-36) ====================

  async submitChangeRequest(
    dto: SubmitChangeRequestDto,
    requestedByEmployeeId: string,
  ): Promise<StructureChangeRequestDocument> {
    // Generate unique request number
    const requestNumber = `CHR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const changeRequest = new this.changeRequestModel({
      requestNumber,
      requestedByEmployeeId: new Types.ObjectId(requestedByEmployeeId),
      requestType: dto.requestType,
      targetDepartmentId: dto.targetDepartmentId
        ? new Types.ObjectId(dto.targetDepartmentId)
        : undefined,
      targetPositionId: dto.targetPositionId
        ? new Types.ObjectId(dto.targetPositionId)
        : undefined,
      reportingTo: dto.reportingTo
        ? new Types.ObjectId(dto.reportingTo)
        : undefined,
      jobKey: dto.jobKey,
      payGrade: dto.payGrade ? new Types.ObjectId(dto.payGrade) : undefined,
      title: dto.title,
      departmentId: dto.departmentId
        ? new Types.ObjectId(dto.departmentId)
        : undefined,
      costCenter: dto.costCenter,
      details: dto.details,
      reason: dto.reason,
      status: StructureRequestStatus.SUBMITTED,
      submittedByEmployeeId: new Types.ObjectId(requestedByEmployeeId),
      submittedAt: new Date(),
    });

    return changeRequest.save();
  }

  async getAllChangeRequests(): Promise<StructureChangeRequestDocument[]> {
    return this.changeRequestModel.find().exec();
  }

  async getChangeRequestById(
    id: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.changeRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Change request with ID ${id} not found`);
    }
    return request;
  }

  async approveChangeRequest(
    id: string,
    dto: ApproveChangeRequestDto,
    approverId: string,
  ): Promise<StructureChangeRequestDocument> {
    const request = await this.getChangeRequestById(id);

    if (request.status !== StructureRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        `Change request is not in SUBMITTED status. Current status: ${request.status}`,
      );
    }

    if (dto.decision === ApprovalDecision.APPROVED) {
      // Apply the changes
      await this.applyChangeRequest(request, approverId);

      request.status = StructureRequestStatus.APPROVED;
    } else if (dto.decision === ApprovalDecision.REJECTED) {
      request.status = StructureRequestStatus.REJECTED;
    }

    // Update request with approver info
    // Note: You may want to add approverId and approvedAt fields to the schema

    return request.save();
  }

  private async applyChangeRequest(
    request: StructureChangeRequestDocument,
    approverId: string,
  ): Promise<void> {
    if (request.requestType === StructureRequestType.UPDATE_POSITION) {
      if (!request.targetPositionId) {
        throw new BadRequestException('Target position ID is required');
      }

      const position = await this.getPositionById(
        request.targetPositionId.toString(),
      );
      const beforeSnapshot = position.toObject();

      // Apply changes from request
      if (request.reportingTo) {
        // REQ-OSM-09: Check for circular reporting
        const isCircular = await this.checkCircularReporting(
          request.targetPositionId.toString(),
          request.reportingTo.toString(),
        );
        if (isCircular) {
          throw new BadRequestException(
            'Circular reporting line detected (REQ-OSM-09)',
          );
        }
        position.reportsToPositionId = request.reportingTo;
      }
      if (request.jobKey) position.jobKey = request.jobKey;
      if (request.payGrade) {
        // BR-10: Validate payGradeId
        const payGradeValid = await this.payrollStub.validatePayGrade(
          request.payGrade.toString(),
        );
        if (!payGradeValid) {
          throw new BadRequestException('Invalid pay grade');
        }
        position.payGradeId = request.payGrade;
      }
      if (request.title) position.title = request.title;
      if (request.departmentId) {
        position.departmentId = request.departmentId;
      }
      if (request.costCenter) position.costCenter = request.costCenter;

      await position.save();

      // BR-22: Audit log
      await this.createAuditLog(
        ChangeLogAction.UPDATED,
        'Position',
        position._id,
        approverId,
        beforeSnapshot as unknown as Record<string, unknown>,
        position.toObject() as unknown as Record<string, unknown>,
        `Position updated via change request ${request.requestNumber}`,
      );
    } else if (request.requestType === StructureRequestType.UPDATE_DEPARTMENT) {
      if (!request.targetDepartmentId) {
        throw new BadRequestException('Target department ID is required');
      }

      const department = await this.getDepartmentById(
        request.targetDepartmentId.toString(),
      );
      const beforeSnapshot = department.toObject();

      if (request.costCenter) department.costCenter = request.costCenter;
      // Add other department update fields as needed

      await department.save();

      // BR-22: Audit log
      await this.createAuditLog(
        ChangeLogAction.UPDATED,
        'Department',
        department._id,
        approverId,
        beforeSnapshot as unknown as Record<string, unknown>,
        department.toObject() as unknown as Record<string, unknown>,
        `Department updated via change request ${request.requestNumber}`,
      );
    }

    request.status = StructureRequestStatus.IMPLEMENTED;
    await request.save();
  }

  // ==================== Hierarchy Methods ====================

  async getHierarchy(managerId?: string) {
    const positions = await this.positionModel.find({ isActive: true }).exec();
    if (managerId) {
      return HierarchyBuilder.getSubtree(positions, managerId);
    }
    return HierarchyBuilder.buildFullHierarchy(positions);
  }

  async getSubtree(managerId: string) {
    const positions = await this.positionModel.find({ isActive: true }).exec();
    return HierarchyBuilder.getSubtree(positions, managerId);
  }
}
