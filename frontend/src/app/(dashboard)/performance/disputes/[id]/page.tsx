'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalDispute, ResolveDisputeDto, DisputeResolutionAction, AppraisalDisputeStatus } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { isManager, isHRAdmin } from '@/lib/performanceRoles';

export default function DisputeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [dispute, setDispute] = useState<AppraisalDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveData, setResolveData] = useState<ResolveDisputeDto>({
    action: DisputeResolutionAction.APPROVE,
    resolutionSummary: '',
    resolvedByEmployeeId: '',
    updatedTotalScore: undefined,
    updatedOverallRatingLabel: '',
  });

  useEffect(() => {
    loadDispute();
  }, [id]);

  const loadDispute = async () => {
    try {
      setLoading(true);
      setError(null);
      const disputes = await performanceService.getDisputes({});
      const found = disputes.find((d) => d._id === id);
      if (found) {
        setDispute(found);
      } else {
        setError('Dispute not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveData.resolutionSummary || !resolveData.resolvedByEmployeeId) {
      setError('Resolution summary and your employee ID are required');
      return;
    }
    try {
      setResolving(true);
      setError(null);
      await performanceService.resolveDispute(id, resolveData);
      await loadDispute();
      setShowResolveForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading dispute..." />;
  }

  if (error && !dispute) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} />
        <Button onClick={() => router.push('/performance/disputes')}>
          Back to Disputes
        </Button>
      </div>
    );
  }

  if (!dispute) {
    return <Loading text="Loading..." />;
  }

  // Only Managers and HR Admins can resolve disputes
  const canResolve = 
    (isManager(user?.role) || isHRAdmin(user?.role)) &&
    (dispute.status === AppraisalDisputeStatus.OPEN || dispute.status === AppraisalDisputeStatus.UNDER_REVIEW);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Dispute Details</h1>
            <PerformanceStatusBadge status={dispute.status} type="dispute" />
          </div>
          <p className="text-gray-600 mt-1">Dispute #{dispute._id.slice(-8)}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/performance/disputes')}>
          Back
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid gap-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Reason</label>
              <p className="text-gray-900 mt-1 font-medium">{dispute.reason}</p>
            </div>
            {dispute.details && (
              <div>
                <label className="text-sm font-medium text-gray-500">Details</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{dispute.details}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Appraisal ID</label>
                <p className="text-gray-900">{dispute.appraisalId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Assignment ID</label>
                <p className="text-gray-900">{dispute.assignmentId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cycle ID</label>
                <p className="text-gray-900">{dispute.cycleId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Raised By</label>
                <p className="text-gray-900">{dispute.raisedByEmployeeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(dispute.createdAt)}</p>
              </div>
              {dispute.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolved At</label>
                  <p className="text-gray-900">{formatDate(dispute.resolvedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {dispute.resolutionSummary && (
          <Card title="Resolution">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Resolution Summary</label>
                <p className="text-gray-900 mt-1">{dispute.resolutionSummary}</p>
              </div>
              {dispute.resolvedByEmployeeId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolved By</label>
                  <p className="text-gray-900">{dispute.resolvedByEmployeeId}</p>
                </div>
              )}
              {dispute.updatedTotalScore !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated Total Score</label>
                  <p className="text-gray-900 font-bold">{dispute.updatedTotalScore.toFixed(2)}</p>
                </div>
              )}
              {dispute.updatedOverallRatingLabel && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated Rating Label</label>
                  <p className="text-gray-900 font-bold">{dispute.updatedOverallRatingLabel}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {canResolve && !showResolveForm && (
          <Card>
            <Button onClick={() => setShowResolveForm(true)}>
              Resolve Dispute
            </Button>
          </Card>
        )}

        {showResolveForm && (
          <Card title="Resolve Dispute">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Action *
                </label>
                <select
                  required
                  value={resolveData.action}
                  onChange={(e) => setResolveData({ ...resolveData, action: e.target.value as DisputeResolutionAction })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={DisputeResolutionAction.APPROVE}>Approve</option>
                  <option value={DisputeResolutionAction.REJECT}>Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Summary *
                </label>
                <textarea
                  required
                  value={resolveData.resolutionSummary}
                  onChange={(e) => setResolveData({ ...resolveData, resolutionSummary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain the resolution decision..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Employee ID *
                </label>
                <input
                  type="text"
                  required
                  value={resolveData.resolvedByEmployeeId}
                  onChange={(e) => setResolveData({ ...resolveData, resolvedByEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your employee ID"
                />
              </div>

              {resolveData.action === DisputeResolutionAction.APPROVE && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated Total Score (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={resolveData.updatedTotalScore || ''}
                      onChange={(e) => setResolveData({ ...resolveData, updatedTotalScore: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New total score"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated Overall Rating Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={resolveData.updatedOverallRatingLabel || ''}
                      onChange={(e) => setResolveData({ ...resolveData, updatedOverallRatingLabel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New rating label"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button onClick={handleResolve} isLoading={resolving}>
                  Submit Resolution
                </Button>
                <Button variant="outline" onClick={() => setShowResolveForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

