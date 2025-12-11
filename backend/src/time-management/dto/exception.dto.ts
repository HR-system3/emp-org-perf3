import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';

export class CreateTimeExceptionDto {
  @IsMongoId()
  employeeId: string;

  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsMongoId()
  attendanceRecordId: string;

  @IsMongoId()
  assignedTo: string; // manager/HR responsible

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}

export class ReviewTimeExceptionDto {
  @IsEnum(TimeExceptionStatus)
  status: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
