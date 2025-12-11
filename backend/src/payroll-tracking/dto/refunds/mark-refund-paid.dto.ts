import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MarkRefundPaidDto {
  @IsMongoId()
  @IsNotEmpty()
  financeStaffId: string;

  @IsMongoId()
  @IsNotEmpty()
  paidInPayrollRunId: string;
}