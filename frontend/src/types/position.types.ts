export enum PositionStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  INACTIVE = 'INACTIVE',
  VACANT = 'VACANT',
  DELIMITED = 'DELIMITED',
}

export interface Position {
  /**
   * MongoDB document _id
   */
  id: string;
  /**
   * Business position identifier (BR-5), e.g. "POS-001"
   */
  positionId: string;
  code: string;
  title: string;
  description?: string;
  jobKey: string;
  departmentId: string;
  payGradeId: string;
  reportsToPositionId?: string;
  status: PositionStatus;
  costCenter: string;
  effectiveEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDTO {
  positionId: string;
  code: string;
  title: string;
  description?: string;
  jobKey: string;
  departmentId: string;
  payGradeId: string;
  reportsToPositionId?: string;
  status?: PositionStatus;
  costCenter: string;
}

export interface UpdatePositionDTO {
  code?: string;
  title?: string;
  description?: string;
  jobKey?: string;
  departmentId?: string;
  payGradeId?: string;
  reportsToPositionId?: string | null;
  status?: PositionStatus;
  costCenter?: string;
  isActive?: boolean;
}

export interface DelimitPositionDTO {
  /**
   * Effective end date in ISO string (YYYY-MM-DD or full ISO)
   */
  effectiveEnd: string;
  reason?: string;
}