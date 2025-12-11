import {
  IsMongoId,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { PunchPolicy } from '../models/enums';

export class CreateShiftTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateShiftTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  shiftTypeId: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // e.g. "09:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // e.g. "17:00"

  @IsEnum(PunchPolicy)
  punchPolicy: PunchPolicy;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceInMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceOutMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;
}

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsMongoId()
  shiftTypeId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startTime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  endTime?: string;

  @IsOptional()
  @IsEnum(PunchPolicy)
  punchPolicy?: PunchPolicy;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceInMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceOutMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class AssignShiftDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  positionId?: string;

  @IsMongoId()
  shiftId: string;

  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // ISO date string "2025-12-01T00:00:00.000Z"

  @IsOptional()
  @IsString()
  endDate?: string; // ISO or omitted (ongoing)
}

export class GetAssignmentsQueryDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  positionId?: string;

  @IsOptional()
  @IsString()
  date?: string; // ISO date string to find active assignments on that date
}