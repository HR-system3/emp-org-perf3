// src/auth/dto/RegisterRequestDto.ts
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: string; // e.g. 'EMPLOYEE', 'HR_ADMIN'
}
