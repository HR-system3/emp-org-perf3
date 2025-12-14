import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectDisputeDto {
  @IsMongoId()
  financeStaffId: string;

  @IsNotEmpty()
  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  resolutionComment?: string;
}
