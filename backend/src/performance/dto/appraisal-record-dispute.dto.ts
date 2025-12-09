import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class RatingEntryDto {
  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsNumber()
  ratingValue: number;

  @IsOptional()
  @IsString()
  ratingLabel?: string;

  @IsOptional()
  @IsNumber()
  weightedScore?: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateAppraisalRecordDto {
  @IsString()
  assignmentId: string;

  @IsString()
  cycleId: string;

  @IsString()
  templateId: string;

  @IsString()
  employeeProfileId: string;

  @IsString()
  managerProfileId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingEntryDto)
  ratings: RatingEntryDto[];

  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsString()
  overallRatingLabel?: string;

  @IsOptional()
  @IsString()
  managerSummary?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvementAreas?: string;
}

export class UpdateAppraisalRecordDto extends PartialType(
  CreateAppraisalRecordDto,
) {}

export class PublishAppraisalRecordDto {
  @IsString()
  publishedByEmployeeId: string;
}

export class AcknowledgeAppraisalRecordDto {
  @IsOptional()
  @IsString()
  employeeAcknowledgementComment?: string;
}

export enum DisputeResolutionAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class CreateDisputeDto {
  @IsString()
  appraisalId: string;

  @IsString()
  assignmentId: string;

  @IsString()
  cycleId: string;

  @IsString()
  raisedByEmployeeId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class ResolveDisputeDto {
  @IsEnum(DisputeResolutionAction)
  action: DisputeResolutionAction;

  @IsString()
  resolutionSummary: string;

  @IsString()
  resolvedByEmployeeId: string;

  @IsOptional()
  @IsNumber()
  updatedTotalScore?: number;

  @IsOptional()
  @IsString()
  updatedOverallRatingLabel?: string;
}
