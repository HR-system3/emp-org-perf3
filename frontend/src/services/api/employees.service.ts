import axiosInstance from './axios.config';
import { HierarchyNode } from '@/types/employee.types';

export const employeesService = {
  async getHierarchy(): Promise<HierarchyNode[]> {
    const response = await axiosInstance.get<HierarchyNode[]>('/organization-structure/hierarchy');
    return response.data;
  },

  async getSubtree(managerId: string): Promise<HierarchyNode[]> {
    const response = await axiosInstance.get<HierarchyNode[]>(
      `/organization-structure/hierarchy/subtree/${managerId}`
    );
    return response.data;
  },
};