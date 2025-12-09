// ./src/employee-profile/dto/assign-role.dto.ts
import { SystemRole } from '../enums/employee-profile.enums';

export class AssignRoleDto {
  /**
   * Employee profile (Mongo) id – passed via route param,
   * kept here for possible reuse in other flows.
   */
  employeeId?: string;

  roles: SystemRole[];
}
