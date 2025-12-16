'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';
import { EmployeeProfile } from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';

export default function EmployeesDirectoryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function loadEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EmployeeProfile[]>('/employee-profile', {
        params: { search: search || undefined },
      });
      setEmployees(res.data);
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to load employees.';
      setError(
        typeof backendMessage === 'string'
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = employees.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.employeeNumber.toLowerCase().includes(q) ||
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      (e.status || '').toLowerCase().includes(q)
    );
  });

  if (loading && !employees.length) {
    return <Loading text="Loading employees..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees Directory</h1>
          <p className="text-gray-600 mt-1">
            Browse all employee profiles stored in the system. Use the search box to filter by name, employee number, or status.
          </p>
        </div>
        <Button onClick={() => router.push('/employee-profile/new')}>
          + New Employee
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name, employee number, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button onClick={loadEmployees} disabled={loading} variant="outline">
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Hire
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/employee-profile/${emp._id}`)}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/employee-profile/${emp._id}`}
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="employee" value={emp.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {emp.dateOfHire
                        ? new Date(emp.dateOfHire).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/employee-profile/${emp._id}`);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}