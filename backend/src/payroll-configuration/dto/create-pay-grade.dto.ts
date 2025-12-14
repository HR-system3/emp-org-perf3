import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePayGradeDto {
  @IsNotEmpty()
  grade: string;

  @IsNumber()
  @Min(6000)
  baseSalary: number;

  @IsNumber()
  @Min(6000)
  grossSalary: number;
}
