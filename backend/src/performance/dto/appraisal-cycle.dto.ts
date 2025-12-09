import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { AppraisalTemplateType } from '../enums/performance.enums';

export class CycleTemplateAssignmentDto {
  @IsString()
  templateId: string;

  @IsArray()
  @IsString({ each: true })
  departmentIds: string[];
}

export class CreateAppraisalCycleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AppraisalTemplateType)
  cycleType: AppraisalTemplateType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  managerDueDate?: string;

  @IsOptional()
  @IsDateString()
  employeeAcknowledgementDueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CycleTemplateAssignmentDto)
  templateAssignments?: CycleTemplateAssignmentDto[];
}

export class UpdateAppraisalCycleDto extends PartialType(
  CreateAppraisalCycleDto,
) {}
