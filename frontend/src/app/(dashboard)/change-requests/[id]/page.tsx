'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ChangeRequest } from '@/types/changeRequest.types';
import { CHANGE_REQUEST_STATUS_COLORS, CHANGE_REQUEST_TYPE_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function ChangeRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canApprove = hasPermission(user?.role || '', 'canApproveChangeRequests');

  useEffect(() => {
    if (!id) return;
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const data = await changeRequestsService.getChangeRequestById(id);
      setRequest(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load change request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!user?.id) {
      setError('Unable to determine approver identity.');
      return;
    }

    let comments: string | undefined;
    if (decision === 'REJECTED') {
      const input = prompt('Enter rejection comments (optional):') || '';
      comments = input.trim() || undefined;
    }

    try {
      setIsProcessing(true);
      setError('');
      await changeRequestsService.approveChangeRequest(
        id,
        { decision, comments },
        user.id,
      );
      await fetchRequest();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading change request..." />;
  }

  if (error && !request) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message={error} />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!request) return null;

  const statusClass =
    CHANGE_REQUEST_STATUS_COLORS[request.status] ||
    'bg-gray-100 text-gray-800';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Change Requests
        </Button>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
        >
          {request.status}
        </span>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {CHANGE_REQUEST_TYPE_LABELS[request.type] || request.type}
            </h1>
            <p className="text-sm text-gray-500">
              Request #{request.requestNumber} •{' '}
              {formatDateTime(request.createdAt)}
            </p>
          </div>

          {error && (
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.targetPositionId && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Target Position
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {request.targetPositionId}
                </p>
              </div>
            )}
            {request.targetDepartmentId && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Target Department
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {request.targetDepartmentId}
                </p>
              </div>
            )}
            {request.departmentId && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  New Department
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {request.departmentId}
                </p>
              </div>
            )}
            {request.reportingTo && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Reports To
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {request.reportingTo}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-gray-800">
                {request.reason || 'No reason provided'}
              </p>
            </div>
            {request.details && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Details
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {request.details}
                </p>
              </div>
            )}
          </div>

          {canApprove && request.status === 'SUBMITTED' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => handleDecision('APPROVED')}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                ✓ Approve &amp; apply changes
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDecision('REJECTED')}
                disabled={isProcessing}
              >
                ✗ Reject
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

