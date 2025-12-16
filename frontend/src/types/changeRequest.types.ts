// UI-facing status values mapped from backend StructureRequestStatus
export type ChangeRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'IMPLEMENTED';

// High-level request categories exposed in the UI
export enum ChangeRequestType {
  POSITION_CHANGE = 'POSITION_CHANGE',
  DEPARTMENT_CHANGE = 'DEPARTMENT_CHANGE',
  TRANSFER = 'TRANSFER',
}

// Normalised shape used by the frontend, mapped from StructureChangeRequest
export interface ChangeRequest {
  id: string;
  requestNumber: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  reason?: string;
  details?: string;
  // Targets
  targetDepartmentId?: string;
  targetPositionId?: string;
  // For position/transfer changes
  departmentId?: string;
  reportingTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Payload from the submit form. We keep it UI‑oriented and map it to the
// backend DTO in the API service.
export interface CreateChangeRequestDTO {
  type: ChangeRequestType;
  positionId?: string;
  sourceDepartmentId?: string;
  targetDepartmentId?: string;
  reportingToPositionId?: string;
  reason: string;
  details?: string;
}

// Approval payload mapped to backend ApproveChangeRequestDto
export interface ApprovalDTO {
  decision: 'APPROVED' | 'REJECTED';
  comments?: string;
}