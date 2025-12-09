import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class BulkAssignAppraisalsDto {
  @IsString()
  cycleId: string;

  @IsString()
  templateId: string;

  @IsArray()
  assignments: {
    employeeProfileId: string;
    managerProfileId: string;
    departmentId: string;
    positionId?: string;
    dueDate?: string;
  }[];
}
