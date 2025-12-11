import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTerminationBenefitDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  terms?: string;
}
