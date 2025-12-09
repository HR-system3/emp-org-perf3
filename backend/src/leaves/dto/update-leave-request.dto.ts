import {
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  IsDateString,
} from 'class-validator';

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  attachmentIds?: string[];
}
