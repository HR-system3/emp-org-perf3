import { IsString, IsEnum } from 'class-validator';
import { Role } from '../../auth/enums/roles.enum';

export class AssignRoleDto {
  @IsString()
  @IsEnum(Role)
  role: string;
}
