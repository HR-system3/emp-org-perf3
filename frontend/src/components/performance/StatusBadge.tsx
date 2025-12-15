import React from 'react';
import {
  AppraisalCycleStatus,
  AppraisalAssignmentStatus,
  AppraisalRecordStatus,
  AppraisalDisputeStatus,
} from '@/types/performance.types';

interface StatusBadgeProps {
  status: AppraisalCycleStatus | AppraisalAssignmentStatus | AppraisalRecordStatus | AppraisalDisputeStatus;
  type: 'cycle' | 'assignment' | 'record' | 'dispute';
}

export default function PerformanceStatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusColor = () => {
    const statusStr = status.toString();
    
    if (type === 'cycle') {
      switch (statusStr) {
        case AppraisalCycleStatus.ACTIVE:
          return 'bg-green-100 text-green-800 border-green-200';
        case AppraisalCycleStatus.PLANNED:
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case AppraisalCycleStatus.CLOSED:
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case AppraisalCycleStatus.ARCHIVED:
          return 'bg-gray-100 text-gray-600 border-gray-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    if (type === 'assignment' || type === 'record') {
      switch (statusStr) {
        case AppraisalAssignmentStatus.NOT_STARTED:
        case AppraisalRecordStatus.DRAFT:
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case AppraisalAssignmentStatus.IN_PROGRESS:
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case AppraisalAssignmentStatus.SUBMITTED:
        case AppraisalRecordStatus.MANAGER_SUBMITTED:
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case AppraisalAssignmentStatus.PUBLISHED:
        case AppraisalRecordStatus.HR_PUBLISHED:
          return 'bg-green-100 text-green-800 border-green-200';
        case AppraisalAssignmentStatus.ACKNOWLEDGED:
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case AppraisalRecordStatus.ARCHIVED:
          return 'bg-gray-100 text-gray-600 border-gray-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    if (type === 'dispute') {
      switch (statusStr) {
        case AppraisalDisputeStatus.OPEN:
          return 'bg-red-100 text-red-800 border-red-200';
        case AppraisalDisputeStatus.UNDER_REVIEW:
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case AppraisalDisputeStatus.ADJUSTED:
          return 'bg-green-100 text-green-800 border-green-200';
        case AppraisalDisputeStatus.REJECTED:
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {formatStatus(status)}
    </span>
  );
}

