'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { CreateDisputeDto } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

function isValidObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export default function CreateDisputePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFromUrl = useMemo(
    () => ({
      appraisalId: searchParams.get('appraisalId') || '',
      assignmentId: searchParams.get('assignmentId') || '',
      cycleId: searchParams.get('cycleId') || '',
      raisedByEmployeeId: searchParams.get('employeeId') || '',
    }),
    [searchParams],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDisputeDto>({
    appraisalId: initialFromUrl.appraisalId,
    assignmentId: initialFromUrl.assignmentId,
    cycleId: initialFromUrl.cycleId,
    raisedByEmployeeId: initialFromUrl.raisedByEmployeeId,
    reason: '',
    details: '',
  });

  const hasPrefilledIds =
    !!initialFromUrl.appraisalId &&
    !!initialFromUrl.assignmentId &&
    !!initialFromUrl.cycleId &&
    !!initialFromUrl.raisedByEmployeeId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for Mongo ObjectIds to avoid internal server error
    const { appraisalId, assignmentId, cycleId, raisedByEmployeeId } = formData;
    if (
      !isValidObjectId(appraisalId) ||
      !isValidObjectId(assignmentId) ||
      !isValidObjectId(cycleId) ||
      !isValidObjectId(raisedByEmployeeId)
    ) {
      setError(
        'One or more internal IDs are invalid. Please create a dispute from a published appraisal record or contact HR.',
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await performanceService.createDispute(formData);
      router.push('/performance/disputes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Dispute</h1>
          <p className="text-gray-600 mt-1">Raise a dispute about your appraisal</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appraisal ID *
                </label>
                {hasPrefilledIds ? (
                  <p className="text-sm text-gray-900 break-all">{formData.appraisalId}</p>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.appraisalId}
                    onChange={(e) => setFormData({ ...formData, appraisalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Appraisal record ID"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment ID *
                </label>
                {hasPrefilledIds ? (
                  <p className="text-sm text-gray-900 break-all">{formData.assignmentId}</p>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.assignmentId}
                    onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Assignment ID"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cycle ID *
                </label>
                {hasPrefilledIds ? (
                  <p className="text-sm text-gray-900 break-all">{formData.cycleId}</p>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.cycleId}
                    onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cycle ID"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Employee ID *
                </label>
                {hasPrefilledIds ? (
                  <p className="text-sm text-gray-900 break-all">
                    {formData.raisedByEmployeeId}
                  </p>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.raisedByEmployeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, raisedByEmployeeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your employee ID"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief reason for dispute"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide detailed explanation of your dispute..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={loading}>
                Submit Dispute
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

