'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalDispute, AppraisalDisputeStatus } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { isEmployee, isManager, isHRAdmin } from '@/lib/performanceRoles';

export default function DisputesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<AppraisalDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    cycleId: '',
  });

  useEffect(() => {
    loadDisputes();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filters.status) params.status = filters.status as AppraisalDisputeStatus;
      if (filters.cycleId) params.cycleId = filters.cycleId;
      
      // Employees: Only see their own disputes
      if (isEmployee(user?.role) && user?.id) {
        params.employeeProfileId = user.id;
      }
      
      // Managers: See disputes for their team (backend will filter)
      // HR Admin: See all disputes
      
      const data = await performanceService.getDisputes(params);
      setDisputes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading disputes..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal Disputes</h1>
          <p className="text-gray-600 mt-1">
            {isEmployee(user?.role)
              ? 'View and create disputes for your performance records'
              : isManager(user?.role)
              ? 'Resolve disputes for your team members'
              : 'Manage performance appraisal disputes'}
          </p>
        </div>
        {/* Only Employees can create disputes */}
        {isEmployee(user?.role) && (
          <Button onClick={() => router.push('/performance/disputes/new')}>
            Create Dispute
          </Button>
        )}
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
          {Object.values(AppraisalDisputeStatus).map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No disputes found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/performance/disputes/new')}
            >
              Create First Dispute
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute) => (
            <Card
              key={dispute._id}
              onClick={() => router.push(`/performance/disputes/${dispute._id}`)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dispute #{dispute._id.slice(-8)}
                    </h3>
                    <PerformanceStatusBadge status={dispute.status} type="dispute" />
                  </div>
                  <p className="text-gray-600 mb-2">{dispute.reason}</p>
                  {dispute.details && (
                    <p className="text-sm text-gray-500 mb-2">{dispute.details}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Appraisal: {dispute.appraisalId.slice(-8)}</span>
                    <span>Raised by: {dispute.raisedByEmployeeId}</span>
                    <span>Created: {formatDate(dispute.createdAt)}</span>
                    {dispute.resolvedAt && (
                      <span>Resolved: {formatDate(dispute.resolvedAt)}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/performance/disputes/${dispute._id}`);
                  }}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

