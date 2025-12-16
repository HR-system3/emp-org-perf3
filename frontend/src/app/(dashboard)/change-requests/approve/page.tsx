'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ChangeRequest } from '@/types/changeRequest.types';
import { formatDateTime } from '@/lib/utils';
import { CHANGE_REQUEST_TYPE_LABELS } from '@/lib/constants';

export default function ApproveChangeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const data = await changeRequestsService.getAllChangeRequests();
      const pending = data.filter((req) => req.status === 'PENDING');
      setRequests(pending);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load change requests');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading pending requests..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Change Requests
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Approve Change Requests</h1>
        <p className="text-gray-600 mt-2">
          Review pending change requests and click into a request to approve or reject it.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {requests.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No pending requests</p>
            <p className="text-sm mt-2">All change requests have been processed</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {CHANGE_REQUEST_TYPE_LABELS[request.type] || request.type}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Requested on:</span>{' '}
                        {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    SUBMITTED
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
                  <p className="text-gray-600">{request.reason || 'No reason provided'}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/change-requests/${request.id}`)}
                  >
                    Review &amp; decide
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}