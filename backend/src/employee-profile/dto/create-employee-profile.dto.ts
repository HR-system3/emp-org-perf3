// ./src/employee-profile/dto/create-employee-profile.dto.ts
import {
  ContractType,
  EmployeeStatus,
  Gender,
  MaritalStatus,
} from '../enums/employee-profile.enums';

export class CreateEmployeeProfileDto {
  // Core employee code / number
  employeeNumber: string;

  // Personal info
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  dateOfBirth: Date;

  // Employment info
  dateOfHire: Date;
  contractType: ContractType;

  // Optional, but useful for seeding / integration
  positionTitle: string;
  departmentName: string;
  departmentCode?: string;

  /**
   * Reference to PayrollConfiguration.payGrade document
   * (ObjectId as string)
   */
  payGradeId?: string;

  // Optional extra
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  status?: EmployeeStatus;
}