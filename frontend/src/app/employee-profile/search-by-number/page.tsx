'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { EmployeeProfile } from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';

export default function SearchByEmployeeNumberPage() {
  const router = useRouter();
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [result, setResult] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!employeeNumber.trim()) {
      setError('Please enter an employee number.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get<EmployeeProfile>(
        `/employee-profile/employee-number/${employeeNumber.trim()}`
      );

      if (!res.data) {
        setError('No employee found with this employee number.');
        return;
      }

      setResult(res.data);
    } catch (err: any) {
      console.error('Search error:', err);
      const backendMessage =
        err?.response?.data?.message || err?.response?.data || err.message;

      setError(
        typeof backendMessage === 'string'
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Employee by Number</h1>
          <p className="text-gray-600 mt-1">
            Quickly look up an existing employee using their employee number (e.g., EMP-0012).
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. EMP-0012"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {result && (
          <div className="mt-6 space-y-4">
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  name={`${result.firstName} ${result.lastName}`}
                  size={48}
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {result.firstName} {result.lastName}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {result.employeeNumber}
                  </p>
                </div>
                <div>
                  <StatusBadge kind="employee" value={result.status} />
                </div>
              </div>
              <Button
                onClick={() => router.push(`/employee-profile/${result._id}`)}
                variant="outline"
                size="sm"
              >
                View Full Profile
              </Button>
            </Card>

            <Card title="Raw JSON Data">
              <p className="text-sm text-gray-600 mb-4">
                Employee data as stored in the database:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}