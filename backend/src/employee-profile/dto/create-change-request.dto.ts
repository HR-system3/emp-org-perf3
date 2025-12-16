// ./src/employee-profile/dto/create-change-request.dto.ts
import { IsEnum, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';
import { ChangeRequestCategory } from '../enums/employee-profile.enums';

/**
 * Used when an employee submits a correction / critical change request.
 * US-E6-02, US-E2-06.
 */
export class CreateChangeRequestDto {
  // Employee id is passed in route param; keep optional for flexibility
  @IsOptional()
  @IsMongoId({ message: 'employeeId must be a valid ObjectId' })
  employeeId?: string;

  @IsEnum(ChangeRequestCategory, {
    message: `category must be one of: ${Object.values(ChangeRequestCategory).join(', ')}`,
  })
  category: ChangeRequestCategory;

  /**
   * Structured payload with field changes.
   * Example: { primaryDepartmentId: "...", maritalStatus: "MARRIED" }
   */
  @IsObject({ message: 'requestedChanges must be an object' })
  requestedChanges: Record<string, any>;

  /**
   * Optional free-text explanation.
   */
  @IsOptional()
  @IsString({ message: 'reason must be a string' })
  reason?: string;
}
