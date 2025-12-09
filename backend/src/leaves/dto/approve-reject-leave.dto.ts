import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApproveRejectLeaveDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}
