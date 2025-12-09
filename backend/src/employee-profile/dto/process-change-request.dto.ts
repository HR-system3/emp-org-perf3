// ./src/employee-profile/dto/process-change-request.dto.ts
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

/**
 * HR Manager / System Admin processing a change request.
 * BR 36, BR 22.
 */
export class ProcessChangeRequestDto {
  status: ProfileChangeStatus;

  /**
   * If APPROVED, this payload will be applied to the EmployeeProfile.
   * Example: { primaryDepartmentId: "...", status: "ACTIVE" }
   */
  appliedChanges?: Record<string, any>;
}
