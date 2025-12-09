import {
  IsMongoId,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class ManualAdjustmentDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  change: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  meta?: Record<string, any>;
}
