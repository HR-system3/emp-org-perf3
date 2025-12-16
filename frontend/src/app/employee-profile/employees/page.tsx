'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import { api } from '@/lib/axios';
import { EmployeeProfile } from '@/types/employeeProfile';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function EmployeeDirectoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    fetchEmployees();
  }, [authLoading, user]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<EmployeeProfile[]>('/employee-profile');
      let data = res.data;

      // Department Head/Employee: only show employees in their department if departmentId is known
      const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
      const isDepartmentHead = normalizedRole === 'department head';
      const isDepartmentEmployee = normalizedRole === 'department employee';

      if ((isDepartmentHead || isDepartmentEmployee) && user?.departmentId) {
        data = data.filter((emp) => {
          const deptId = typeof emp.primaryDepartmentId === 'string'
            ? emp.primaryDepartmentId
            : (emp.primaryDepartmentId as any)?._id;
          return deptId === user.departmentId;
        });
      }

      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <Loading size="lg" text="Loading employees..." />;
  }

  // If user lacks permission entirely
  if (!hasPermission(user?.role || '', 'canViewAllEmployees')) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You do not have permission to view the employee directory." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
        <p className="text-gray-600 mt-2">Browse all employees</p>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError('')} />
      )}

      {employees.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-gray-500">No employees found.</div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => {
                  const position = emp.primaryPositionId;
                  const positionTitle =
                    typeof position === 'object' && position !== null
                      ? (position as any).title || '—'
                      : '—';

                  return (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/employee-profile/${emp._id}`} className="flex items-center gap-3">
                          <Avatar name={`${emp.firstName} ${emp.lastName}`} size={40} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{emp.personalEmail || emp.nationalId}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{emp.employeeNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{positionTitle}</td>
                      <td className="px-4 py-3">
                        <StatusBadge kind="employee" value={emp.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/employee-profile/${emp._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
