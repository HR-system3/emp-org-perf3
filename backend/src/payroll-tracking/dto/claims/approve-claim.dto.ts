import { 
  IsMongoId, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  Min 
} from 'class-validator';

export class ApproveClaimDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  approvedAmount: number;

  @IsMongoId()
  @IsNotEmpty()
  financeStaffId: string;

  @IsOptional()
  resolutionComment?: string;
}
