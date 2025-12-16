'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { CreateChangeRequestDTO, ChangeRequestType } from '@/types/changeRequest.types';
import { CHANGE_REQUEST_TYPE_LABELS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { useDepartments } from '@/hooks/useDepartments';
import { usePositions } from '@/hooks/usePositions';

export default function SubmitChangeRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { departments } = useDepartments();
  const { positions } = usePositions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateChangeRequestDTO>({
    type: ChangeRequestType.POSITION_CHANGE,
    positionId: '',
    sourceDepartmentId: '',
    targetDepartmentId: '',
    reportingToPositionId: '',
    reason: '',
    details: '',
  });

  // Check permission
  if (!hasPermission(user?.role || '', 'canSubmitChangeRequests')) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You do not have permission to submit change requests." />
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason?.trim()) {
      setError('Please provide a reason for this change request');
      return;
    }

    if (!user?.id) {
      setError('Unable to determine current user for this request.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await changeRequestsService.createChangeRequest(
        {
          ...formData,
          reason: formData.reason.trim(),
          details: formData.details?.trim() || undefined,
        },
        user.id,
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/change-requests');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Request Submitted</h2>
            <p className="text-gray-600">Your change request has been submitted successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to change requests page...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Change Requests
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submit Change Request</h1>
        <p className="text-gray-600 mt-2">
          Submit a request for organizational structure changes
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <Card title="Change Request Form">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as ChangeRequestType,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.entries(CHANGE_REQUEST_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position (for position change / transfer)
              </label>
              <select
                value={formData.positionId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, positionId: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select position</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Department (for department change / transfer)
              </label>
              <select
                value={formData.targetDepartmentId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetDepartmentId: e.target.value || undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Manager Position (optional)
            </label>
            <select
              value={formData.reportingToPositionId || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reportingToPositionId: e.target.value || undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No change</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change *
            </label>
            <textarea
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Explain why this change is needed..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (optional)
            </label>
            <textarea
              value={formData.details || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any extra context for the approver..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

