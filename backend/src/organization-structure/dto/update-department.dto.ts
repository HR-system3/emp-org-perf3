import {
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Department code',
    example: 'HR',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({
    description: 'Department name',
    example: 'Human Resources',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Handles all HR operations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Head position ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  headPositionId?: string;

  @ApiPropertyOptional({
    description: 'Cost center',
    example: 'CC-HR-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  costCenter?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


