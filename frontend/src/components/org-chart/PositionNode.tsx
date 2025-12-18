'use client';

import React, { useState } from 'react';
import { PositionNode } from '@/types/organization.types';
import { PositionStatus } from '@/types/position.types';

interface PositionNodeProps {
  node: PositionNode;
}

/**
 * Position-based organizational hierarchy node component
 * 
 * Displays:
 * - Position title (primary)
 * - Employee name/avatar if assigned, or "Vacant" if not
 * - Status badge (Active, Frozen, Inactive, Vacant, Delimited)
 * - Position ID
 * - Expandable/collapsible children
 */
export default function PositionNodeComponent({ node }: PositionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getStatusBadgeColor = (status: PositionStatus): string => {
    switch (status) {
      case PositionStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-300';
      case PositionStatus.FROZEN:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case PositionStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case PositionStatus.VACANT:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case PositionStatus.DELIMITED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: PositionStatus): string => {
    switch (status) {
      case PositionStatus.ACTIVE:
        return 'Active';
      case PositionStatus.FROZEN:
        return 'Frozen';
      case PositionStatus.INACTIVE:
        return 'Inactive';
      case PositionStatus.VACANT:
        return 'Vacant';
      case PositionStatus.DELIMITED:
        return 'Delimited';
      default:
        return status;
    }
  };

  const getEmployeeInitials = (employee: PositionNode['employee']): string => {
    if (!employee) return '?';
    const first = employee.firstName?.[0] || '';
    const last = employee.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Position Card */}
      <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow min-w-[240px] max-w-[280px]">
        <div className="text-center">
          {/* Employee Avatar or Vacant Indicator */}
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-semibold border-2"
            style={{
              backgroundColor: node.employee ? '#DBEAFE' : '#FEF3C7',
              borderColor: node.employee ? '#3B82F6' : '#F59E0B',
              color: node.employee ? '#1E40AF' : '#92400E',
            }}
          >
            {node.employee ? (
              node.employee.avatar ? (
                <img
                  src={node.employee.avatar}
                  alt={`${node.employee.firstName} ${node.employee.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getEmployeeInitials(node.employee)
              )
            ) : (
              '📋'
            )}
          </div>

          {/* Position Title (Primary) */}
          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
            {node.title}
          </h3>

          {/* Employee Name or Vacant */}
          <div className="mb-2">
            {node.employee ? (
              <p className="text-sm font-medium text-gray-700">
                {node.employee.firstName} {node.employee.lastName}
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-600 italic">
                Vacant
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-2 ${getStatusBadgeColor(node.status)}`}>
            {getStatusLabel(node.status)}
          </div>

          {/* Position ID */}
          <p className="text-xs text-gray-500 mt-1">
            {node.positionId}
          </p>

          {/* Department Name (if available) */}
          {node.departmentName && (
            <p className="text-xs text-gray-400 mt-1">
              {node.departmentName}
            </p>
          )}

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? '▼ Collapse' : '▶ Expand'} ({node.children!.length})
            </button>
          )}
        </div>
      </div>

      {/* Children Positions */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center mt-6">
          {/* Vertical connector line */}
          <div className="w-px h-6 bg-gray-300"></div>
          
          {/* Horizontal container for children */}
          <div className="flex gap-8 flex-wrap justify-center">
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Horizontal connector line */}
                <div className="w-px h-6 bg-gray-300"></div>
                <PositionNodeComponent node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
