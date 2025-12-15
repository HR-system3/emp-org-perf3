'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalCycle } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function CycleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cycle, setCycle] = useState<AppraisalCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCycle();
  }, [id]);

  const loadCycle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getCycle(id);
      setCycle(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cycle');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading cycle..." />;
  }

  if (error || !cycle) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error || 'Cycle not found'} />
        <Button onClick={() => router.push('/performance/cycles')}>
          Back to Cycles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{cycle.name}</h1>
            {cycle.status && (
              <PerformanceStatusBadge status={cycle.status} type="cycle" />
            )}
          </div>
          <p className="text-gray-600 mt-1">Cycle Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/performance/cycles/${id}/progress`)}>
            View Progress
          </Button>
          <Button variant="outline" onClick={() => router.push(`/performance/cycles/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push('/performance/cycles')}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="space-y-4">
            {cycle.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{cycle.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Cycle Type</label>
                <p className="text-gray-900 mt-1">{cycle.cycleType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900 mt-1">
                  {cycle.status ? (
                    <PerformanceStatusBadge status={cycle.status} type="cycle" />
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-gray-900 mt-1">{formatDate(cycle.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-gray-900 mt-1">{formatDate(cycle.endDate)}</p>
              </div>
              {cycle.managerDueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager Due Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(cycle.managerDueDate)}</p>
                </div>
              )}
              {cycle.employeeAcknowledgementDueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Acknowledgement Due Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(cycle.employeeAcknowledgementDueDate)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900 mt-1">{formatDate(cycle.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 mt-1">{formatDate(cycle.updatedAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        {cycle.templateAssignments && cycle.templateAssignments.length > 0 && (
          <Card title="Template Assignments">
            <div className="space-y-3">
              {cycle.templateAssignments.map((assignment, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                  <p className="font-medium text-gray-900">Template ID: {assignment.templateId}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Departments: {assignment.departmentIds.length} assigned
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

