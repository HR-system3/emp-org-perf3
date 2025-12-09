import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsEnum,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PositionStatus } from '../enums/organization-structure.enums';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Unique position identifier (BR-5)',
    example: 'POS-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  positionId: string;

  @ApiProperty({
    description: 'Position code',
    example: 'HR-MGR',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Position title',
    example: 'HR Manager',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Position description',
    example: 'Manages HR operations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Job key (BR-10: Position must have JobKey)',
    example: 'HR-MGR-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  jobKey: string;

  @ApiProperty({
    description: 'Department ID (BR-10: Position must have Dept ID)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'Pay grade ID (BR-10: Position must have Pay Grade)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  payGradeId: string;

  @ApiPropertyOptional({
    description:
      'Reporting position ID (BR-30: Reporting manager if not top-level)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string;

  @ApiPropertyOptional({
    description: 'Position status (BR-16)',
    enum: PositionStatus,
    default: PositionStatus.VACANT,
  })
  @IsEnum(PositionStatus)
  @IsOptional()
  status?: PositionStatus;

  @ApiProperty({
    description: 'Cost center (BR-30: Creation requires Cost Center)',
    example: 'CC-HR-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  costCenter: string;
}


