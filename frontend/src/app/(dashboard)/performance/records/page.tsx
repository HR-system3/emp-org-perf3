'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalAssignment, AppraisalAssignmentStatus } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function RecordsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    cycleId: '',
    status: '',
  });

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filters.cycleId) params.cycleId = filters.cycleId;
      if (filters.status) params.status = filters.status as AppraisalAssignmentStatus;
      const data = await performanceService.getAssignments(params);
      setAssignments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal Records</h1>
          <p className="text-gray-600 mt-1">View and manage appraisal records</p>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="flex gap-2">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          {Object.values(AppraisalAssignmentStatus).map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No assignments found</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment._id}
              onClick={() => {
                if (assignment.latestAppraisalId) {
                  router.push(`/performance/records/${assignment.latestAppraisalId}`);
                } else {
                  router.push(`/performance/records/new?assignmentId=${assignment._id}`);
                }
              }}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assignment ID: {assignment._id}
                    </h3>
                    <PerformanceStatusBadge status={assignment.status} type="assignment" />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Employee: {assignment.employeeProfileId}</span>
                    <span>Manager: {assignment.managerProfileId}</span>
                    {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate)}</span>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (assignment.latestAppraisalId) {
                      router.push(`/performance/records/${assignment.latestAppraisalId}`);
                    } else {
                      router.push(`/performance/records/new?assignmentId=${assignment._id}`);
                    }
                  }}
                >
                  {assignment.latestAppraisalId ? 'View' : 'Create Record'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

