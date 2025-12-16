'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/axios';
import {
  ChangeRequestCategory,
  EmployeeProfileChangeRequest,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const categories: ChangeRequestCategory[] = [
  'PERSONAL_INFORMATION',
  'JOB_INFORMATION',
  'ORGANIZATIONAL_ASSIGNMENT',
  'COMPENSATION_AND_BENEFITS',
  'OTHER',
];

export default function NewChangeRequestPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [category, setCategory] = useState<ChangeRequestCategory>(
    'PERSONAL_INFORMATION'
  );
  const [reason, setReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState(
    '{\n  "fieldName": "newValue"\n}'
  );
  const [result, setResult] = useState<EmployeeProfileChangeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsed: Record<string, any> = {};
      if (requestedChanges.trim()) {
        parsed = JSON.parse(requestedChanges);
      }

      const payload = {
        category,
        reason: reason || undefined,
        requestedChanges: parsed,
      };

      const res = await api.post<EmployeeProfileChangeRequest>(
        `/employee-profile/${employeeId}/change-requests`,
        payload
      );
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError('Invalid JSON in requestedChanges');
      } else {
        setError(err.response?.data?.message || 'Failed to create request');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!employeeId) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <p className="text-gray-500">Missing employee id in URL.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Profile Change Request</h1>
          <p className="text-gray-600 mt-1">
            Submit a change request for employee profile. Employee Profile ID: {employeeId}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card title="Create Change Request">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ChangeRequestCategory)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (free text)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for the change request..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested Changes (JSON)
            </label>
            <textarea
              rows={6}
              value={requestedChanges}
              onChange={(e) => setRequestedChanges(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder='{"fieldName": "newValue"}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: {'{"primaryDepartmentId": "...", "status": "ACTIVE"}'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Change Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <Card title="Created Request">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Change request created successfully. Request ID: {result.requestId}
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
