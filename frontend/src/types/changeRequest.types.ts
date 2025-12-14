export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ChangeRequestType {
  DEPARTMENT_CREATE = 'DEPARTMENT_CREATE',
  DEPARTMENT_UPDATE = 'DEPARTMENT_UPDATE',
  DEPARTMENT_DELETE = 'DEPARTMENT_DELETE',
  POSITION_CREATE = 'POSITION_CREATE',
  POSITION_UPDATE = 'POSITION_UPDATE',
  POSITION_DELETE = 'POSITION_DELETE',
  POSITION_DEACTIVATE = 'POSITION_DEACTIVATE',
}

export interface ChangeRequest {
  id: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  requestedBy: string;
  requestedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  targetEntityId?: string;
  targetEntityType?: string;
  changes: Record<string, any>;
  reason?: string;
  approvedBy?: string;
  approvedByUser?: {
    id: string;
    name: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface CreateChangeRequestDTO {
  type: ChangeRequestType;
  targetEntityId?: string;
  targetEntityType?: string;
  changes: Record<string, any>;
  reason?: string;
}

export interface ApprovalDTO {
  approved: boolean;
  reason?: string;
}