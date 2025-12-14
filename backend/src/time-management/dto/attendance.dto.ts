import { IsMongoId, IsOptional, IsDateString } from 'class-validator';

export class ClockInOutDto {
  @IsMongoId()
  employeeId: string;

  // Optional override (useful for testing / seed)
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class GetAttendanceQueryDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  // For simplicity we filter by punch timestamps
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
