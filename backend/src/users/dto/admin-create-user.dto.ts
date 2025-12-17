import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

// Admin-only DTO for creating auth users (no employee profile touch)
export class AdminCreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  role: string;

  @IsOptional()
  isActive?: boolean;
}
