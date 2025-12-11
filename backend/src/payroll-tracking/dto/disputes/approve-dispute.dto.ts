import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class ApproveDisputeDto {
  @IsMongoId()
  financeStaffId: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;
}

