'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { EmployeeProfile } from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';

export default function ManagerTeamDemoPage() {
  const router = useRouter();
  const [managerId, setManagerId] = useState('');
  const [team, setTeam] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!managerId) return;
    setLoading(true);
    setError(null);
    setTeam([]);

    try {
      const res = await api.get<EmployeeProfile[]>(
        `/employee-profile/manager/${managerId}/team`
      );
      setTeam(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Team View</h1>
          <p className="text-gray-600 mt-1">
            View direct reports and basic team information for a manager. Paste
            Manager&apos;s EmployeeProfile Mongo _id to load the team.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        <form onSubmit={handleLoad} className="flex gap-3">
          <input
            type="text"
            placeholder="Manager employeeProfile _id"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Load Team'}
          </Button>
        </form>
      </Card>

      {loading && <Loading text="Loading team..." />}

      {team.length > 0 && (
        <Card title="Team Members">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {team.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${emp.firstName} ${emp.lastName}`}
                          size={40}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {emp.employeeNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.employeeNumber}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="employee" value={emp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && !error && team.length === 0 && managerId && (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No team members found.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
