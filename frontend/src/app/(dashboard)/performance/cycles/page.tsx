'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalCycle, AppraisalCycleStatus } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { isHRAdmin, isManager } from '@/lib/performanceRoles';

export default function CyclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadCycles();
  }, [statusFilter]);

  const loadCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getCycles(statusFilter || undefined);
      setCycles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading cycles..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal Cycles</h1>
          <p className="text-gray-600 mt-1">
            {isManager(user?.role) 
              ? 'View performance appraisal cycles and track progress'
              : 'Manage performance appraisal cycles'}
          </p>
        </div>
        {/* Only HR Admin can create cycles */}
        {isHRAdmin(user?.role) && (
          <Button onClick={() => router.push('/performance/cycles/new')}>
            Create Cycle
          </Button>
        )}
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        {Object.values(AppraisalCycleStatus).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {cycles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No cycles found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/performance/cycles/new')}
            >
              Create First Cycle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cycles.map((cycle) => (
            <Card
              key={cycle._id}
              onClick={() => router.push(`/performance/cycles/${cycle._id}`)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{cycle.name}</h3>
                    {cycle.status && (
                      <PerformanceStatusBadge status={cycle.status} type="cycle" />
                    )}
                  </div>
                  {cycle.description && (
                    <p className="text-gray-600 mb-3">{cycle.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Type: {cycle.cycleType.replace(/_/g, ' ')}</span>
                    <span>Start: {formatDate(cycle.startDate)}</span>
                    <span>End: {formatDate(cycle.endDate)}</span>
                    {cycle.managerDueDate && (
                      <span>Manager Due: {formatDate(cycle.managerDueDate)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Managers and HR Admin can view progress */}
                  {(isManager(user?.role) || isHRAdmin(user?.role)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/performance/cycles/${cycle._id}/progress`);
                      }}
                    >
                      Progress
                    </Button>
                  )}
                  {/* Only HR Admin can edit cycles */}
                  {isHRAdmin(user?.role) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/performance/cycles/${cycle._id}/edit`);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

