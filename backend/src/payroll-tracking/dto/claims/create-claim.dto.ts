import { 
  IsMongoId, 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  Min 
} from 'class-validator';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  claimType: string;

  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
