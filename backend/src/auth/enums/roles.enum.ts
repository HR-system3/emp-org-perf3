// Role enum - maps to SystemRole from employee-profile
export enum Role {
  DEPARTMENT_EMPLOYEE = 'department employee',
  DEPARTMENT_HEAD = 'department head',
  HR_MANAGER = 'HR Manager',
  HR_EMPLOYEE = 'HR Employee',
  HR_ADMIN = 'HR Admin',
  PAYROLL_SPECIALIST = 'Payroll Specialist',
  PAYROLL_MANAGER = 'Payroll Manager',
  SYSTEM_ADMIN = 'System Admin',
  LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
  RECRUITER = 'Recruiter',
  FINANCE_STAFF = 'Finance Staff',
  JOB_CANDIDATE = 'Job Candidate',
  // Aliases for backward compatibility
  EMPLOYEE = 'department employee',
  MANAGER = 'department head',
  HR = 'HR Manager',
  ADMIN = 'System Admin',
}

