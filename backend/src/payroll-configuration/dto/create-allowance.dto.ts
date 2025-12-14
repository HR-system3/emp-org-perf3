import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateAllowanceDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
