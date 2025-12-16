import { api } from '@/lib/axios';
import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@/types/department.types';

type DepartmentApi = {
  _id: string;
  deptId: string;
  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  costCenter: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapDepartment(api: DepartmentApi): Department {
  const { _id, ...rest } = api;
  return { id: _id, ...rest };
}

export const departmentsService = {
  async getAllDepartments(): Promise<Department[]> {
    const response = await api.get<DepartmentApi[]>(
      '/organization-structure/departments',
    );
    return response.data.map(mapDepartment);
  },

  async getDepartmentById(id: string): Promise<Department> {
    const response = await api.get<DepartmentApi>(
      `/organization-structure/departments/${id}`,
    );
    return mapDepartment(response.data);
  },

  async createDepartment(dto: CreateDepartmentDTO): Promise<Department> {
    const response = await api.post<DepartmentApi>(
      '/organization-structure/departments',
      dto,
    );
    return mapDepartment(response.data);
  },

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDTO,
  ): Promise<Department> {
    const response = await api.put<DepartmentApi>(
      `/organization-structure/departments/${id}`,
      dto,
    );
    return mapDepartment(response.data);
  },
};



