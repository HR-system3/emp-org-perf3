import { api } from '@/lib/axios';
import {
  ChangeRequest,
  ChangeRequestType,
  CreateChangeRequestDTO,
  ApprovalDTO,
} from '@/types/changeRequest.types';

// Backend API shape (StructureChangeRequest)
type StructureChangeRequestApi = {
  _id: string;
  requestNumber: string;
  requestType: 'NEW_DEPARTMENT' | 'UPDATE_DEPARTMENT' | 'NEW_POSITION' | 'UPDATE_POSITION' | 'CLOSE_POSITION';
  status: string;
  reason?: string;
  details?: string;
  targetDepartmentId?: string;
  targetPositionId?: string;
  departmentId?: string;
  reportingTo?: string;
  createdAt: string;
  updatedAt: string;
};

function mapType(apiType: StructureChangeRequestApi['requestType']): ChangeRequestType {
  switch (apiType) {
    case 'UPDATE_POSITION':
    case 'CLOSE_POSITION':
      return ChangeRequestType.POSITION_CHANGE;
    case 'UPDATE_DEPARTMENT':
      return ChangeRequestType.DEPARTMENT_CHANGE;
    case 'NEW_POSITION':
    case 'NEW_DEPARTMENT':
    default:
      // Treat structural moves as transfers by default
      return ChangeRequestType.TRANSFER;
  }
}

function mapChangeRequest(api: StructureChangeRequestApi): ChangeRequest {
  return {
    id: api._id,
    requestNumber: api.requestNumber,
    type: mapType(api.requestType),
    status: api.status as any,
    reason: api.reason,
    details: api.details,
    targetDepartmentId: api.targetDepartmentId,
    targetPositionId: api.targetPositionId,
    departmentId: api.departmentId,
    reportingTo: api.reportingTo,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export const changeRequestsService = {
  async getAllChangeRequests(): Promise<ChangeRequest[]> {
    const response = await api.get<StructureChangeRequestApi[]>(
      '/organization-structure/change-requests',
    );
    return response.data.map(mapChangeRequest);
  },

  async getChangeRequestById(id: string): Promise<ChangeRequest> {
    const response = await api.get<StructureChangeRequestApi>(
      `/organization-structure/change-requests/${id}`,
    );
    return mapChangeRequest(response.data);
  },

  // Employee/HR submits change request
  async createChangeRequest(
    dto: CreateChangeRequestDTO,
    requestedByEmployeeId: string,
  ): Promise<ChangeRequest> {
    // Map UI DTO to backend SubmitChangeRequestDto
    const payload: any = {
      requestType:
        dto.type === ChangeRequestType.DEPARTMENT_CHANGE
          ? 'UPDATE_DEPARTMENT'
          : 'UPDATE_POSITION',
      targetDepartmentId: dto.type === ChangeRequestType.DEPARTMENT_CHANGE ? dto.targetDepartmentId : undefined,
      targetPositionId: dto.positionId,
      // For TRANSFER, use targetDepartmentId as the new department; for position changes, use sourceDepartmentId if provided
      departmentId:
        dto.type === ChangeRequestType.TRANSFER
          ? dto.targetDepartmentId
          : dto.sourceDepartmentId || undefined,
      reportingTo: dto.reportingToPositionId,
      details: dto.details,
      reason: dto.reason,
    };

    const response = await api.post<StructureChangeRequestApi>(
      '/organization-structure/change-requests',
      payload,
      {
        params: { requestedBy: requestedByEmployeeId },
      },
    );
    return mapChangeRequest(response.data);
  },

  // HR Manager approves / rejects
  async approveChangeRequest(
    id: string,
    dto: ApprovalDTO,
    approverId: string,
  ): Promise<ChangeRequest> {
    const response = await api.post<StructureChangeRequestApi>(
      `/organization-structure/change-requests/${id}/approve`,
      dto,
      {
        params: { approverId },
      },
    );
    return mapChangeRequest(response.data);
  },
};


