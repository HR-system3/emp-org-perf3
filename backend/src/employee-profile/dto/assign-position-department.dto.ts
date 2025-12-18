import { IsMongoId, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for assigning position and department to an employee profile
 * 
 * This assignment can only be performed by HR Admin or HR Manager.
 * Employees and Department Managers cannot assign positions or departments.
 */
export class AssignPositionDepartmentDto {
  @ApiProperty({
    description: 'Position ID (MongoDB ObjectId) - Required',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  primaryPositionId: string;

  @ApiProperty({
    description: 'Department ID (MongoDB ObjectId) - Required',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  primaryDepartmentId: string;

  @ApiPropertyOptional({
    description: 'Supervisor Position ID (MongoDB ObjectId) - Optional',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  supervisorPositionId?: string;
}
