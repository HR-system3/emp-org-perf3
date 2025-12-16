//./src/types/employee.types.ts

export interface Employee {
  id: string;
  name: string;
  email: string;
  positionId: string;
  position?: {
    id: string;
    title: string;
  };
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  managerId?: string;
  manager?: {
    id: string;
    name: string;
  };
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  email: string;
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  managerId?: string;
  children?: HierarchyNode[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  positionTitle: string;
  departmentName: string;
  hireDate?: string;
}