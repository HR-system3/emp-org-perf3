// ./src/types/employeeProfile.ts

export type Gender = 'MALE' | 'FEMALE';

export type MaritalStatus =
  | 'SINGLE'
  | 'MARRIED'
  | 'DIVORCED'
  | 'WIDOWED';

export type EmployeeStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_LEAVE'
  | 'SUSPENDED'
  | 'RETIRED'
  | 'PROBATION'
  | 'TERMINATED';

export type ContractType =
  | 'FULL_TIME_CONTRACT'
  | 'PART_TIME_CONTRACT';

export type ProfileChangeStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED';

export type ChangeRequestCategory =
  | 'PERSONAL_INFORMATION'
  | 'JOB_INFORMATION'
  | 'ORGANIZATIONAL_ASSIGNMENT'
  | 'COMPENSATION_AND_BENEFITS'
  | 'OTHER';

export interface Address {
  city?: string;
  streetAddress?: string;
  country?: string;
}

export interface EmployeeProfile {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  dateOfBirth?: string;
  dateOfHire: string;
  contractType?: ContractType;
  status: EmployeeStatus;
  // Soft deactivation flags (backend audit)
  isActive?: boolean;
  deactivatedAt?: string;
  deactivationReason?: string;
  biography?: string;
  address?: Address;
  payGradeId?: any;
  primaryDepartmentId?: any;
  primaryPositionId?: any;
}

export interface CreateEmployeeProfileDto {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  dateOfHire: string;
  contractType: ContractType;
  positionTitle?: string;
  departmentName?: string;
  departmentCode?: string;
  payGradeId?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  status?: EmployeeStatus;
}

export interface SelfServiceUpdateProfileDto {
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  biography?: string;
  profilePictureUrl?: string;
  address?: Address;
}

export interface EmployeeProfileChangeRequest {
  _id: string;
  requestId: string;
  employeeProfileId: string;
  requestDescription: string;
  requestedChanges?: Record<string, any>;
  reason?: string;
  status: ProfileChangeStatus;
  submittedAt: string;
  processedAt?: string;
}
