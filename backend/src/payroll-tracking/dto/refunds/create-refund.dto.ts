import { IsMongoId, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateRefundDto {
  @IsOptional()
  @IsMongoId()
  claimId?: string;

  @IsOptional()
  @IsMongoId()
  disputeId?: string;

  @IsObject()
  @IsNotEmpty()
  refundDetails: {
    description: string;
    amount: number;
  };

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsOptional()
  @IsMongoId()
  financeStaffId?: string;
}