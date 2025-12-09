// ./src/employee-profile/dto/create-change-request.dto.ts
import { ChangeRequestCategory } from '../enums/employee-profile.enums';

/**
 * Used when an employee submits a correction / critical change request.
 * US-E6-02, US-E2-06.
 */
export class CreateChangeRequestDto {
  // Employee id is passed in route param; keep optional for flexibility
  employeeId?: string;

  category: ChangeRequestCategory;

  /**
   * Structured payload with field changes.
   * Example: { primaryDepartmentId: "...", maritalStatus: "MARRIED" }
   */
  requestedChanges: Record<string, any>;

  /**
   * Optional free-text explanation.
   */
  reason?: string;
}
