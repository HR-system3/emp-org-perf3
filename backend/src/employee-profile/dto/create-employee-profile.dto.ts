// ./src/employee-profile/dto/create-employee-profile.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import {
  ContractType,
  EmployeeStatus,
  Gender,
  MaritalStatus,
} from '../enums/employee-profile.enums';

export class CreateEmployeeProfileDto {
  // Core employee code / number
  @IsString()
  @IsNotEmpty()
  employeeNumber: string;

  // Personal info
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string | Date;

  // Employment info
  @IsDateString()
  @IsNotEmpty()
  dateOfHire: string | Date;

  @IsEnum(ContractType)
  @IsNotEmpty()
  contractType: ContractType;

  // Optional, but useful for seeding / integration
  @IsString()
  @IsOptional()
  positionTitle?: string;

  @IsString()
  @IsOptional()
  departmentName?: string;

  @IsString()
  @IsOptional()
  departmentCode?: string;

  /**
   * Reference to PayrollConfiguration.payGrade document
   * (ObjectId as string)
   */
  @ValidateIf((o) => o.payGradeId !== undefined && o.payGradeId !== null && o.payGradeId !== '')
  @IsMongoId()
  @IsOptional()
  payGradeId?: string;

  // Optional extra
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}