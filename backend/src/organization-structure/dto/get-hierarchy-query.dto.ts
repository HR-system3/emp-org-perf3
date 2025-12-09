import { IsOptional, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetHierarchyQueryDto {
  @ApiPropertyOptional({
    description: 'Manager ID to get subtree for (REQ-SANV-02)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({
    description: 'Position ID to get subtree for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  positionId?: string;
}


