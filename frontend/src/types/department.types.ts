export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  positionsCount?: number;
  employeesCount?: number;
}

export interface CreateDepartmentDTO {
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}