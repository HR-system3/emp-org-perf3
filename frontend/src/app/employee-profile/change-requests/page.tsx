'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import {
  EmployeeProfileChangeRequest,
  ProfileChangeStatus,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';

const statuses: (ProfileChangeStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELED',
];

export default function ChangeRequestsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ProfileChangeStatus | 'ALL'>(
    'ALL'
  );
  const [items, setItems] = useState<EmployeeProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const params =
        statusFilter === 'ALL' ? {} : { status: statusFilter.toString() };

      const res = await api.get<EmployeeProfileChangeRequest[]>(
        '/employee-profile/change-requests',
        { params }
      );

      setItems(res.data);
    } catch (err: any) {
      console.error(err);
      // Handle 403 Forbidden errors with a user-friendly message
      if (err?.response?.status === 403) {
        setError('You do not have permission to access change requests. Please contact your administrator.');
        setItems([]); // Clear items on permission error
      } else if (err?.response?.status === 401) {
        // Don't show error for 401 - the interceptor will redirect
        setLoading(false);
        return;
      } else {
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          'Failed to load change requests.';
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  if (loading && !items.length) {
    return <Loading text="Loading change requests..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
          <p className="text-gray-600 mt-1">
            Review all submitted profile change requests and filter by status (Pending, Approved, Rejected, or Canceled).
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.back()} variant="outline">
            Back
          </Button>
          <Button onClick={() => router.push('/employee-profile/change-requests/process')}>
            Process Request
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ProfileChangeStatus | 'ALL')
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
          <div className="flex items-end">
            <Button onClick={loadData} disabled={loading} variant="outline">
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {items.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-500">
            <p>No change requests found.</p>
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Profile ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((cr) => (
                  <tr key={cr._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {cr.requestId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cr.employeeProfileId}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="changeRequest" value={cr.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {cr.submittedAt
                        ? new Date(cr.submittedAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/employee-profile/change-requests/process`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
