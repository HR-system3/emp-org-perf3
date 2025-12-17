/**
 * Performance Management Role Utilities
 * 
 * Provides helper functions to check user roles for performance management features.
 * Roles are mapped as follows:
 * - HR Admin: 'HR Admin'
 * - Manager: 'department head'
 * - Employee: 'department employee'
 */

export type PerformanceRole = 'HR' | 'MANAGER' | 'EMPLOYEE';

/**
 * Checks if the user role is HR Admin
 */
export function isHRAdmin(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'hr admin' || role.toLowerCase() === 'hr_admin';
}

/**
 * Checks if the user role is Manager (department head)
 */
export function isManager(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'department head' || 
         role.toLowerCase() === 'department_head' ||
         role.toLowerCase() === 'manager';
}

/**
 * Checks if the user role is Employee (department employee)
 */
export function isEmployee(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'department employee' || 
         role.toLowerCase() === 'department_employee' ||
         role.toLowerCase() === 'employee';
}

/**
 * Gets the performance role category for a user
 */
export function getPerformanceRole(role: string | undefined | null): PerformanceRole | null {
  if (isHRAdmin(role)) return 'HR';
  if (isManager(role)) return 'MANAGER';
  if (isEmployee(role)) return 'EMPLOYEE';
  return null;
}

/**
 * Role-based visibility rules for Performance Management features
 */
export const performanceFeatureAccess = {
  /**
   * HR Admin: Templates, Cycles, Assignments (bulk), All Records, All Disputes
   */
  canViewTemplates: (role: string | undefined | null): boolean => {
    return isHRAdmin(role);
  },

  /**
   * HR Admin: All cycles
   * Manager: View cycles and progress
   * Employee: No access
   */
  canViewCycles: (role: string | undefined | null): boolean => {
    return isHRAdmin(role) || isManager(role);
  },

  /**
   * HR Admin: Bulk assignments
   * Manager: Never see assignments
   * Employee: Never see assignments
   */
  canViewAssignments: (role: string | undefined | null): boolean => {
    return isHRAdmin(role);
  },

  /**
   * HR Admin: All records
   * Manager: Assigned records only
   * Employee: Own records only (via employee endpoint)
   */
  canViewRecords: (role: string | undefined | null): boolean => {
    return isHRAdmin(role) || isManager(role) || isEmployee(role);
  },

  /**
   * HR Admin: All disputes
   * Manager: Can resolve disputes
   * Employee: Can create disputes
   */
  canViewDisputes: (role: string | undefined | null): boolean => {
    return isHRAdmin(role) || isManager(role) || isEmployee(role);
  },
};
