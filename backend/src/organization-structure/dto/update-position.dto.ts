import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PositionStatus } from '../enums/organization-structure.enums';

export class UpdatePositionDto {
  @ApiPropertyOptional({
    description: 'Position code',
    example: 'HR-MGR',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({
    description: 'Position title',
    example: 'Senior HR Manager',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Position description',
    example: 'Manages HR operations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Job key',
    example: 'HR-MGR-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  jobKey?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Pay grade ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  payGradeId?: string;

  @ApiPropertyOptional({
    description: 'Reporting position ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string;

  @ApiPropertyOptional({
    description: 'Position status (BR-16)',
    enum: PositionStatus,
  })
  @IsEnum(PositionStatus)
  @IsOptional()
  status?: PositionStatus;

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


