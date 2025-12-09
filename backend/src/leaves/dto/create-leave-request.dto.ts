import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsDateString,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  attachmentIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPostLeaveSubmission?: boolean;
}
