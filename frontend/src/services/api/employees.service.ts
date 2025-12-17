//./src/services/api/employees.service.ts

import { api } from '@/lib/axios';
import { HierarchyNode } from '@/types/employee.types';
import { EmployeeProfile } from '@/types/employeeProfile';

export const employeesService = {
  async getHierarchy(): Promise<HierarchyNode[]> {
    const response = await api.get<HierarchyNode[]>('/organization-structure/hierarchy');
    return response.data;
  },

  async getSubtree(managerId: string): Promise<HierarchyNode[]> {
    const response = await api.get<HierarchyNode[]>(
      `/organization-structure/hierarchy/subtree/${managerId}`
    );
    return response.data;
  },

  async getTeamByReportingStructure(
    managerId: string,
  ): Promise<EmployeeProfile[]> {
    const response = await api.get<EmployeeProfile[]>(
      `/employee-profile/manager/${managerId}/team/reporting-structure`
    );
    return response.data;
  },

  async getMyReports(): Promise<EmployeeProfile[]> {
    const response = await api.get<EmployeeProfile[]>('/employee-profile/me/reports');
    return response.data;
  },
};