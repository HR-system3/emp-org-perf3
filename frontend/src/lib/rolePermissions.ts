// Role-based permissions configuration
// Maps roles to allowed features/actions

export type UserRole =
  | 'department employee'
  | 'department head'
  | 'HR Manager'
  | 'HR Employee'
  | 'HR Admin'
  | 'Payroll Specialist'
  | 'Payroll Manager'
  | 'System Admin'
  | 'Legal & Policy Admin'
  | 'Recruiter'
  | 'Finance Staff'
  | 'Job Candidate';

export interface RolePermissions {
  // Organization Structure
  canViewDepartments: boolean;
  canCreateDepartments: boolean;
  canUpdateDepartments: boolean;
  canViewPositions: boolean;
  canCreatePositions: boolean;
  canUpdatePositions: boolean;
  canViewChangeRequests: boolean;
  canSubmitChangeRequests: boolean;
  canApproveChangeRequests: boolean;
  canViewOrgChart: boolean;

  // Employee Profile
  canCreateEmployee: boolean;
  canSearchEmployee: boolean;
  canViewAllEmployees: boolean;
  canUpdateEmployee: boolean;
  canViewChangeRequests: boolean;
  canProcessChangeRequests: boolean;
  canViewSelfService: boolean;
  canViewManagerTeam: boolean;
  canAssignRoles: boolean;

  // Performance Management
  canViewTemplates: boolean;
  canCreateTemplates: boolean;
  canUpdateTemplates: boolean;
  canViewCycles: boolean;
  canCreateCycles: boolean;
  canUpdateCycles: boolean;
  canViewAssignments: boolean;
  canCreateAssignments: boolean;
  canViewRecords: boolean;
  canCreateRecords: boolean;
  canUpdateRecords: boolean;
  canPublishRecords: boolean;
  canAcknowledgeRecords: boolean;
  canViewDisputes: boolean;
  canCreateDisputes: boolean;
  canResolveDisputes: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  'department employee': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: false,
    canViewAllEmployees: false,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: true,
    canCreateAssignments: false,
    canViewRecords: true,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: true,
    canViewDisputes: false,
    canCreateDisputes: true,
    canResolveDisputes: false,
  },

  'department head': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: true,
    canSubmitChangeRequests: true,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: false,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: true,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: true,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: true,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: true,
    canCreateAssignments: false,
    canViewRecords: true,
    canCreateRecords: true,
    canUpdateRecords: true,
    canPublishRecords: false,
    canAcknowledgeRecords: true,
    canViewDisputes: true,
    canCreateDisputes: true,
    canResolveDisputes: false,
  },

  'HR Manager': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: true,
    canUpdateDepartments: true,
    canViewPositions: true,
    canCreatePositions: true,
    canUpdatePositions: true,
    canViewChangeRequests: true,
    canSubmitChangeRequests: true,
    canApproveChangeRequests: true,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: true,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: true,
    canViewChangeRequests: true,
    canProcessChangeRequests: true,
    canViewSelfService: true,
    canViewManagerTeam: true,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: true,
    canCreateTemplates: true,
    canUpdateTemplates: true,
    canViewCycles: true,
    canCreateCycles: true,
    canUpdateCycles: true,
    canViewAssignments: true,
    canCreateAssignments: true,
    canViewRecords: true,
    canCreateRecords: true,
    canUpdateRecords: true,
    canPublishRecords: true,
    canAcknowledgeRecords: true,
    canViewDisputes: true,
    canCreateDisputes: true,
    canResolveDisputes: true,
  },

  'HR Employee': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: true,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: true,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: true,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: true,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: true,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: true,
    canCreateAssignments: false,
    canViewRecords: true,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: true,
    canViewDisputes: true,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'HR Admin': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: true,
    canUpdateDepartments: true,
    canViewPositions: true,
    canCreatePositions: true,
    canUpdatePositions: true,
    canViewChangeRequests: true,
    canSubmitChangeRequests: true,
    canApproveChangeRequests: true,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: true,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: true,
    canViewChangeRequests: true,
    canProcessChangeRequests: true,
    canViewSelfService: true,
    canViewManagerTeam: true,
    canAssignRoles: true,

    // Performance Management
    canViewTemplates: true,
    canCreateTemplates: true,
    canUpdateTemplates: true,
    canViewCycles: true,
    canCreateCycles: true,
    canUpdateCycles: true,
    canViewAssignments: true,
    canCreateAssignments: true,
    canViewRecords: true,
    canCreateRecords: true,
    canUpdateRecords: true,
    canPublishRecords: true,
    canAcknowledgeRecords: true,
    canViewDisputes: true,
    canCreateDisputes: true,
    canResolveDisputes: true,
  },

  'Payroll Specialist': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'Payroll Manager': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'System Admin': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: true,
    canUpdateDepartments: true,
    canViewPositions: true,
    canCreatePositions: true,
    canUpdatePositions: true,
    canViewChangeRequests: true,
    canSubmitChangeRequests: true,
    canApproveChangeRequests: true,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: true,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: true,
    canViewChangeRequests: true,
    canProcessChangeRequests: true,
    canViewSelfService: true,
    canViewManagerTeam: true,
    canAssignRoles: true,

    // Performance Management
    canViewTemplates: true,
    canCreateTemplates: true,
    canUpdateTemplates: true,
    canViewCycles: true,
    canCreateCycles: true,
    canUpdateCycles: true,
    canViewAssignments: true,
    canCreateAssignments: true,
    canViewRecords: true,
    canCreateRecords: true,
    canUpdateRecords: true,
    canPublishRecords: true,
    canAcknowledgeRecords: true,
    canViewDisputes: true,
    canCreateDisputes: true,
    canResolveDisputes: true,
  },

  'Legal & Policy Admin': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'Recruiter': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'Finance Staff': {
    // Organization Structure
    canViewDepartments: true,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: true,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: true,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: true,
    canViewAllEmployees: true,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: true,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },

  'Job Candidate': {
    // Organization Structure
    canViewDepartments: false,
    canCreateDepartments: false,
    canUpdateDepartments: false,
    canViewPositions: false,
    canCreatePositions: false,
    canUpdatePositions: false,
    canViewChangeRequests: false,
    canSubmitChangeRequests: false,
    canApproveChangeRequests: false,
    canViewOrgChart: false,

    // Employee Profile
    canCreateEmployee: false,
    canSearchEmployee: false,
    canViewAllEmployees: false,
    canUpdateEmployee: false,
    canViewChangeRequests: false,
    canProcessChangeRequests: false,
    canViewSelfService: false,
    canViewManagerTeam: false,
    canAssignRoles: false,

    // Performance Management
    canViewTemplates: false,
    canCreateTemplates: false,
    canUpdateTemplates: false,
    canViewCycles: false,
    canCreateCycles: false,
    canUpdateCycles: false,
    canViewAssignments: false,
    canCreateAssignments: false,
    canViewRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canPublishRecords: false,
    canAcknowledgeRecords: false,
    canViewDisputes: false,
    canCreateDisputes: false,
    canResolveDisputes: false,
  },
};

// Normalize role string to match the UserRole type
function normalizeRole(role: string): UserRole {
  if (!role) return 'department employee';
  
  // Trim and normalize the role string
  const trimmedRole = role.trim();
  
  // Check if it's already in the correct format (exact match)
  if (trimmedRole in rolePermissions) {
    return trimmedRole as UserRole;
  }
  
  // Map common variations to the correct role format (case-insensitive)
  const roleVariations: Record<string, UserRole> = {
    // HR Admin variations
    'hr_admin': 'HR Admin',
    'hr admin': 'HR Admin',
    'HR_ADMIN': 'HR Admin',
    'HR Admin': 'HR Admin',
    
    // HR Manager variations
    'hr_manager': 'HR Manager',
    'hr manager': 'HR Manager',
    'HR_MANAGER': 'HR Manager',
    'HR Manager': 'HR Manager',
    
    // HR Employee variations
    'hr_employee': 'HR Employee',
    'hr employee': 'HR Employee',
    'HR_EMPLOYEE': 'HR Employee',
    'HR Employee': 'HR Employee',
    
    // Department Head variations
    'department_head': 'department head',
    'department head': 'department head',
    'DEPARTMENT_HEAD': 'department head',
    
    // Department Employee variations
    'department_employee': 'department employee',
    'department employee': 'department employee',
    'DEPARTMENT_EMPLOYEE': 'department employee',
    
    // System Admin variations
    'system_admin': 'System Admin',
    'system admin': 'System Admin',
    'SYSTEM_ADMIN': 'System Admin',
    'System Admin': 'System Admin',
    
    // Payroll Specialist variations
    'payroll_specialist': 'Payroll Specialist',
    'payroll specialist': 'Payroll Specialist',
    'PAYROLL_SPECIALIST': 'Payroll Specialist',
    'Payroll Specialist': 'Payroll Specialist',
    
    // Payroll Manager variations
    'payroll_manager': 'Payroll Manager',
    'payroll manager': 'Payroll Manager',
    'PAYROLL_MANAGER': 'Payroll Manager',
    'Payroll Manager': 'Payroll Manager',
    
    // Legal & Policy Admin variations
    'legal_policy_admin': 'Legal & Policy Admin',
    'legal & policy admin': 'Legal & Policy Admin',
    'LEGAL_POLICY_ADMIN': 'Legal & Policy Admin',
    'Legal & Policy Admin': 'Legal & Policy Admin',
    
    // Recruiter variations
    'recruiter': 'Recruiter',
    'RECRUITER': 'Recruiter',
    'Recruiter': 'Recruiter',
    
    // Finance Staff variations
    'finance_staff': 'Finance Staff',
    'finance staff': 'Finance Staff',
    'FINANCE_STAFF': 'Finance Staff',
    'Finance Staff': 'Finance Staff',
    
    // Job Candidate variations
    'job_candidate': 'Job Candidate',
    'job candidate': 'Job Candidate',
    'JOB_CANDIDATE': 'Job Candidate',
    'Job Candidate': 'Job Candidate',
  };
  
  // Try case-insensitive lookup
  const lowerRole = trimmedRole.toLowerCase();
  for (const [key, value] of Object.entries(roleVariations)) {
    if (key.toLowerCase() === lowerRole) {
      return value;
    }
  }
  
  // Default fallback
  return 'department employee';
}

export function getRolePermissions(role: string): RolePermissions {
  const normalizedRole = normalizeRole(role);
  return rolePermissions[normalizedRole] || rolePermissions['department employee'];
}

export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission] || false;
}

