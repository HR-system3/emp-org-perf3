import { 
  IsMongoId, 
  IsNotEmpty, 
  IsOptional, 
  IsString 
} from 'class-validator';

export class RejectClaimDto {
  @IsMongoId()
  @IsNotEmpty()
  financeStaffId: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason: string;

  @IsOptional()
  resolutionComment?: string;
}
