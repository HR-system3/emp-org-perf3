import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DelimitPositionDto {
  @ApiProperty({
    description:
      'Effective end date (BR-37: Delimiting requires effectiveEnd date)',
    example: '2025-12-31',
  })
  @IsDateString()
  @IsNotEmpty()
  effectiveEnd: string;

  @ApiProperty({
    description: 'Reason for delimiting',
    example: 'Position no longer needed due to restructuring',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}


