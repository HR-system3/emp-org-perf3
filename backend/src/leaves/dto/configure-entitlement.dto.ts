import { IsOptional, IsNumber, IsMongoId } from 'class-validator';

export class ConfigureEntitlementDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  entitlementDays: number;

  @IsOptional()
  @IsNumber()
  accrualRatePerMonth?: number;

  @IsOptional()
  @IsNumber()
  carryOverMax?: number;

  @IsOptional()
  @IsNumber()
  expiryMonths?: number;
}
