import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalDecision } from '../enums/organization-structure.enums';

export class ApproveChangeRequestDto {
  @ApiProperty({
    description: 'Approval decision (BR-36: All changes must be made via workflow approval)',
    enum: ApprovalDecision,
    example: ApprovalDecision.APPROVED,
  })
  @IsEnum(ApprovalDecision)
  @IsNotEmpty()
  decision: ApprovalDecision;

  @ApiPropertyOptional({
    description: 'Comments on the decision',
    example: 'Approved after review of organizational needs',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;
}


