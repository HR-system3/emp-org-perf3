import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { CorrectionRequestStatus } from '../models/enums';

export class CreateCorrectionRequestDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  attendanceRecordId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}

export class ReviewCorrectionRequestDto {
  @IsEnum(CorrectionRequestStatus)
  status: CorrectionRequestStatus;

  // You can reuse "reason" to store the manager’s note if you want
  @IsOptional()
  @IsString()
  reason?: string;
}
