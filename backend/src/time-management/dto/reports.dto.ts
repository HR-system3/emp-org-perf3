import { IsMongoId, IsOptional, IsDateString } from 'class-validator';

export class TimeReportFilterDto {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  // optional, in case later you link to department
  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
