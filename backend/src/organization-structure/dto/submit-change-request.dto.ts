import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StructureRequestType } from '../enums/organization-structure.enums';

export class SubmitChangeRequestDto {
  @ApiProperty({
    description: 'Request type',
    enum: StructureRequestType,
    example: StructureRequestType.UPDATE_POSITION,
  })
  @IsEnum(StructureRequestType)
  @IsNotEmpty()
  requestType: StructureRequestType;

  @ApiPropertyOptional({
    description: 'Target department ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @ApiPropertyOptional({
    description: 'Target position ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;

  // REQ-OSM-03/04: Specific fields for position updates
  @ApiPropertyOptional({
    description: 'New reporting line (reportingTo)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  reportingTo?: string;

  @ApiPropertyOptional({
    description: 'Updated job key',
    example: 'HR-MGR-002',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  jobKey?: string;

  @ApiPropertyOptional({
    description: 'Updated pay grade ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  payGrade?: string;

  @ApiPropertyOptional({
    description: 'Updated position title',
    example: 'Senior HR Manager',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated department ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Updated cost center',
    example: 'CC-HR-002',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  costCenter?: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: 'Requesting change due to reorganization',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  details?: string;

  @ApiProperty({
    description: 'Reason for the change request',
    example: 'Team restructuring requires updated reporting lines',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}


