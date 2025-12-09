import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Unique department identifier (BR-5). If omitted, server will generate one.',
    example: 'DEPT-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  deptId?: string;
  @ApiProperty({
    description: 'Department code',
    example: 'HR',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Department name',
    example: 'Human Resources',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

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

  @ApiProperty({
    description: 'Cost center (BR-30: Creation requires Cost Center)',
    example: 'CC-HR-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  costCenter: string;
}


