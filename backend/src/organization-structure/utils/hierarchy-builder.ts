import { Types } from 'mongoose';
import { Position, PositionDocument } from '../models/position.schema';

export interface PositionWithSubordinates extends Position {
  _id: Types.ObjectId;
  subordinates: PositionWithSubordinates[];
}

/**
 * Builds a recursive organizational hierarchy tree
 * REQ-SANV-01/02: Hierarchy Visibility
 */
export class HierarchyBuilder {
  /**
   * Build full organizational hierarchy
   * Top-level nodes are positions without reportingTo
   * @param positions - Array of all positions
   * @returns Array of top-level positions with recursive subordinates
   */
  static buildFullHierarchy(
    positions: PositionDocument[],
  ): PositionWithSubordinates[] {
    // Create a map for quick lookup
    const positionMap = new Map<string, PositionWithSubordinates>();

    // Initialize all positions with empty subordinates array
    positions.forEach((pos) => {
      positionMap.set(pos._id.toString(), {
        ...pos.toObject(),
        subordinates: [],
      });
    });

    // Build the tree structure
    const rootPositions: PositionWithSubordinates[] = [];

    positions.forEach((pos) => {
      const positionWithSubs = positionMap.get(pos._id.toString());
      if (!positionWithSubs) return;

      // If position has a reporting line, add it as subordinate
      if (pos.reportsToPositionId) {
        const parent = positionMap.get(
          pos.reportsToPositionId.toString(),
        );
        if (parent) {
          parent.subordinates.push(positionWithSubs);
        } else {
          // Parent not found, treat as root
          rootPositions.push(positionWithSubs);
        }
      } else {
        // No reporting line, it's a root position
        rootPositions.push(positionWithSubs);
      }
    });

    return rootPositions;
  }

  /**
   * Get subtree for a specific manager/position
   * REQ-SANV-02: Manager can view their team structure
   * @param positions - Array of all positions
   * @param managerId - Manager position ID or employee ID
   * @returns Position with all subordinates (recursive)
   */
  static getSubtree(
    positions: PositionDocument[],
    managerId: string | Types.ObjectId,
  ): PositionWithSubordinates | null {
    const managerIdStr =
      managerId instanceof Types.ObjectId
        ? managerId.toString()
        : managerId;

    // Find the manager position
    const managerPosition = positions.find(
      (pos) => pos._id.toString() === managerIdStr,
    );

    if (!managerPosition) {
      return null;
    }

    // Build full hierarchy first
    const fullHierarchy = this.buildFullHierarchy(positions);

    // Find the manager in the hierarchy
    const findInHierarchy = (
      nodes: PositionWithSubordinates[],
    ): PositionWithSubordinates | null => {
      for (const node of nodes) {
        if (node._id.toString() === managerIdStr) {
          return node;
        }
        const found = findInHierarchy(node.subordinates);
        if (found) return found;
      }
      return null;
    };

    return findInHierarchy(fullHierarchy);
  }

  /**
   * Get position with subordinates by position ID
   * @param positions - Array of all positions
   * @param positionId - Position ID to find
   * @returns Position with all subordinates (recursive)
   */
  static getPositionWithSubordinates(
    positions: PositionDocument[],
    positionId: string | Types.ObjectId,
  ): PositionWithSubordinates | null {
    return this.getSubtree(positions, positionId);
  }
}


