'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ChangeRequest, ChangeRequestStatus } from '@/types/changeRequest.types';
import { formatDateTime } from '@/lib/utils';
import { CHANGE_REQUEST_STATUS_COLORS, CHANGE_REQUEST_TYPE_LABELS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function ChangeRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await changeRequestsService.getAllChangeRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load change requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(
    (req) => !filterStatus || req.status === filterStatus,
  );

  if (isLoading) {
    return <Loading size="lg" text="Loading change requests..." />;
  }

  const canSubmit = hasPermission(user?.role || '', 'canSubmitChangeRequests');
  const canApprove = hasPermission(user?.role || '', 'canApproveChangeRequests');

  // If user cannot even view change requests, block the page entirely
  if (!hasPermission(user?.role || '', 'canViewChangeRequests')) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You do not have permission to view organization change requests." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change Requests</h1>
          <p className="text-gray-600 mt-2">View and manage change requests</p>
        </div>
        <div className="flex gap-3">
          {canSubmit && (
            <Button onClick={() => router.push('/change-requests/submit')}>
              + Submit Request
            </Button>
          )}
          {canApprove && (
            <Button variant="secondary" onClick={() => router.push('/change-requests/approve')}>
              Approve Requests
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ChangeRequestStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="APPROVED">Approved</option>
          <option value="IMPLEMENTED">Implemented</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No change requests found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {CHANGE_REQUEST_TYPE_LABELS[request.type] || request.type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        CHANGE_REQUEST_STATUS_COLORS[request.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {request.reason || 'No reason provided'}
                  </p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>📅 {formatDateTime(request.createdAt)}</span>
                    {(request.targetPositionId || request.targetDepartmentId) && (
                      <span>
                        🎯{' '}
                        {request.targetPositionId ||
                          request.targetDepartmentId}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/change-requests/${request.id}`)}
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