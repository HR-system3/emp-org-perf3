'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import {
  EmployeeProfileChangeRequest,
  ProfileChangeStatus,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';

const statuses: ProfileChangeStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELED',
];

export default function ProcessChangeRequestPage() {
  const router = useRouter();
  const [requestId, setRequestId] = useState('');
  const [status, setStatus] = useState<ProfileChangeStatus>('APPROVED');
  const [appliedChanges, setAppliedChanges] = useState(
    '{\n  "status": "ACTIVE"\n}'
  );
  const [result, setResult] = useState<EmployeeProfileChangeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsed: Record<string, any> | undefined = undefined;

      if (appliedChanges.trim() && status === 'APPROVED') {
        parsed = JSON.parse(appliedChanges);
      }

      const payload = {
        status,
        appliedChanges: parsed,
      };

      const res = await api.patch<EmployeeProfileChangeRequest>(
        `/employee-profile/change-requests/${requestId}`,
        payload
      );
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError('Invalid JSON in appliedChanges.');
      } else {
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          'Failed to process request.';
        setError(
          typeof backendMessage === 'string'
            ? backendMessage
            : JSON.stringify(backendMessage)
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Change Request</h1>
          <p className="text-gray-600 mt-1">
            Enter a Request ID from the change requests list, set the new status, and
            (optionally) provide a JSON payload with the fields that should be applied
            to the employee profile when the request is approved.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card title="Process Change Request">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request ID *
              </label>
              <input
                type="text"
                placeholder="e.g. ECR-1733..."
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ProfileChangeStatus)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied Changes (JSON, used only when status is{' '}
              <strong>APPROVED</strong>)
            </label>
            <textarea
              rows={6}
              value={appliedChanges}
              onChange={(e) => setAppliedChanges(e.target.value)}
              placeholder={`{\n  "status": "INACTIVE"\n}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Process Request'}
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
        <Card title="Updated Request">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Status: </span>
              <StatusBadge kind="changeRequest" value={result.status} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Updated request data:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
