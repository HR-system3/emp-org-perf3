//./src/services/api/employees.service.ts

import { api } from '@/lib/axios';
import { HierarchyNode } from '@/types/employee.types';
import { EmployeeProfile } from '@/types/employeeProfile';
import { PositionNode } from '@/types/organization.types';
import { Position } from '@/types/position.types';
import { Department } from '@/types/department.types';
import { positionsService } from './positions.service';
import { departmentsService } from './departments.service';

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

  /**
   * Get position-based organizational hierarchy
   * Fetches positions, employees, and departments, then builds a position-based tree
   * with employees mapped to their assigned positions.
   * 
   * Hierarchy is POSITION-based: nodes are positions, employees are displayed within positions.
   */
  async getPositionHierarchy(): Promise<PositionNode[]> {
    // Fetch all required data in parallel
    const [positionsResponse, employeesResponse, departmentsResponse] = await Promise.all([
      positionsService.getAllPositions(),
      api.get<EmployeeProfile[]>('/employee-profile'),
      departmentsService.getAllDepartments(),
    ]);

    const positions = positionsResponse;
    const employees = employeesResponse.data;
    const departments = departmentsResponse;

    // Filter to only active positions for hierarchy
    const activePositions = positions.filter((pos) => pos.isActive);

    // Create maps for quick lookup
    const departmentMap = new Map<string, string>();
    departments.forEach((dept) => {
      departmentMap.set(dept.id, dept.name);
    });

    const employeeMap = new Map<string, EmployeeProfile>();
    employees.forEach((emp) => {
      if (emp.primaryPositionId) {
        // Map by position MongoDB _id (string)
        const positionId = typeof emp.primaryPositionId === 'string' 
          ? emp.primaryPositionId 
          : (emp.primaryPositionId as any)?._id || (emp.primaryPositionId as any)?.toString();
        if (positionId) {
          employeeMap.set(positionId, emp);
        }
      }
    });

    // Create position nodes with employee assignments
    const nodeMap = new Map<string, PositionNode>();
    
    activePositions.forEach((position) => {
      const employee = employeeMap.get(position.id);
      const employeeNode: PositionNode['employee'] = employee
        ? {
            id: employee._id,
            employeeNumber: employee.employeeNumber,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.personalEmail,
            avatar: undefined, // Can be added if profilePictureUrl exists
          }
        : undefined;

      const node: PositionNode = {
        id: position.id,
        positionId: position.positionId,
        title: position.title,
        departmentId: position.departmentId,
        departmentName: departmentMap.get(position.departmentId),
        reportsToPositionId: position.reportsToPositionId,
        status: position.status,
        employee: employeeNode,
        children: [],
      };

      nodeMap.set(position.id, node);
    });

    // Build tree structure using reportsToPositionId relationships
    const rootNodes: PositionNode[] = [];

    nodeMap.forEach((node) => {
      if (node.reportsToPositionId) {
        const parent = nodeMap.get(node.reportsToPositionId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        } else {
          // Parent not found (might be inactive or deleted), treat as root
          rootNodes.push(node);
        }
      } else {
        // No reporting line, it's a root position
        rootNodes.push(node);
      }
    });

    return rootNodes;
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

  /**
   * Assign position and department to an employee profile
   * Restricted to HR Admin, HR Manager, and System Admin only
   */
  async assignPositionDepartment(
    employeeProfileId: string,
    dto: {
      primaryPositionId: string;
      primaryDepartmentId: string;
      supervisorPositionId?: string;
    },
  ): Promise<EmployeeProfile> {
    const response = await api.patch<EmployeeProfile>(
      `/employee-profile/${employeeProfileId}/assign-position-department`,
      dto,
    );
    return response.data;
  },
};