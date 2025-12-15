export interface Department {
  /**
   * MongoDB document _id
   */
  id: string;
  /**
   * Business department identifier (BR-5), e.g. "DEPT-001"
   */
  deptId: string;
  /**
   * Department code, e.g. "HR"
   */
  code: string;

  name: string;
  description?: string;

  headPositionId?: string;

  costCenter: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  employeesCount?: number;
  positionsCount?: number;
}

export interface CreateDepartmentDTO {
  /**
   * Optional business ID; if omitted backend will generate one
   */
  deptId?: string;

  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  costCenter: string;
}

export interface UpdateDepartmentDTO {
  code?: string;
  name?: string;
  description?: string;
  headPositionId?: string;
  costCenter?: string;
  isActive?: boolean;
}

