// Position-based organizational hierarchy types

import { PositionStatus } from './position.types';

/**
 * Employee assignment within a position
 */
export interface PositionEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
}

/**
 * Position node in the organizational hierarchy
 * Hierarchy is POSITION-based, not employee-based
 */
export interface PositionNode {
  // Position information
  id: string; // MongoDB _id
  positionId: string; // Business position ID (e.g., "POS-001")
  title: string;
  departmentId: string;
  departmentName?: string;
  reportsToPositionId?: string;
  status: PositionStatus;
  
  // Employee assignment (nullable - position can be vacant)
  employee?: PositionEmployee;
  
  // Children positions (positions that report to this position)
  children?: PositionNode[];
}
