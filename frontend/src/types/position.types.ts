export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  reportsTo?: string;
  reportsToPosition?: {
    id: string;
    title: string;
  };
  isActive: boolean;
  delimitDate?: string;
  createdAt: string;
  updatedAt: string;
  employeeCount?: number;
}

export interface CreatePositionDTO {
  title: string;
  description?: string;
  departmentId: string;
  reportsTo?: string;
}

export interface UpdatePositionDTO {
  title?: string;
  description?: string;
  departmentId?: string;
  reportsTo?: string;
}

export interface DeactivatePositionDTO {
  reason?: string;
}

export interface DelimitPositionDTO {
  delimitDate: string;
  reason?: string;
}