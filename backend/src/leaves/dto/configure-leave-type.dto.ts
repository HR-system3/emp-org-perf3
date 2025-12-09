import {
  IsString,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsNumber,
} from 'class-validator';

export class ConfigureLeaveTypeDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAttachment?: boolean;

  @IsOptional()
  @IsString()
  attachmentType?: string;

  @IsOptional()
  @IsNumber()
  minTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  maxDurationDays?: number;

  @IsOptional()
  @IsBoolean()
  allowPostLeaveSubmission?: boolean;

  @IsOptional()
  @IsBoolean()
  pauseAccrual?: boolean;

  @IsOptional()
  @IsString()
  payrollPayCode?: string;
}
