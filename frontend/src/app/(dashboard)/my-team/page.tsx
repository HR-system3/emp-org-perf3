'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { employeesService } from '@/services/api/employees.service';
import { EmployeeProfile } from '@/types/employeeProfile';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { hasPermission } from '@/lib/rolePermissions';
import { api } from '@/lib/axios';

export default function MyTeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTeam();
    }
  }, [user]);

  const fetchTeam = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError('');

      const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
      const isDepartmentHead = normalizedRole === 'department head';

      // For Department Head, use new backend endpoint that derives reports from token
      if (isDepartmentHead) {
        const data = await employeesService.getMyReports();
        setTeamMembers(data);
      } else {
        // Fallback to existing reporting-structure logic
        const myProfileRes = await api.get<EmployeeProfile>('/employee-profile/me/self');
        const myEmployeeId = myProfileRes.data._id;
        if (!myEmployeeId) {
          setError('Unable to find your employee profile. Please ensure your profile exists.');
          return;
        }
        const data = await employeesService.getTeamByReportingStructure(myEmployeeId);
        setTeamMembers(data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load team members. Make sure your position has reporting relationships configured (reportsToPositionId).',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading your team..." />;
  }

  // Check if user is Department Head
  const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isDepartmentHead = normalizedRole === 'department head';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
          <p className="text-gray-600 mt-2">
            {isDepartmentHead
              ? 'View employees whose positions report to your position (direct and indirect reports)'
              : 'View your direct reports and team structure'}
          </p>
        </div>
        {hasPermission(user?.role || '', 'canViewManagerTeam') && (
          <Button onClick={fetchTeam} variant="outline" disabled={isLoading}>
            Refresh
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {teamMembers.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-medium">No Team Members</p>
            <p className="text-sm mt-2">
              {isDepartmentHead
                ? 'No employees found whose positions report to your position. Ensure positions have reporting relationships configured (reportsToPositionId).'
                : "You don't have any direct reports at this time"}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card title="Team Members">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => {
                    // Handle populated position and department data
                    const position =
                      typeof member.primaryPositionId === 'object' &&
                      member.primaryPositionId !== null
                        ? (member.primaryPositionId as any)
                        : null;
                    const department =
                      typeof member.primaryDepartmentId === 'object' &&
                      member.primaryDepartmentId !== null
                        ? (member.primaryDepartmentId as any)
                        : null;

                    const positionTitle = position?.title || '—';
                    const departmentName = department?.name || '—';

                    return (
                      <tr
                        key={member._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          router.push(`/employee-profile/${member._id}`)
                        }
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/employee-profile/${member._id}`}
                            className="flex items-center gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Avatar
                              name={`${member.firstName} ${member.lastName}`}
                              size={40}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {member.employeeNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {positionTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {departmentName}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge kind="employee" value={member.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/employee-profile/${member._id}`);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Team Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {teamMembers.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Team Members</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {
                    teamMembers.filter((m) => m.status === 'ACTIVE').length
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">Active Employees</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {
                    new Set(
                      teamMembers
                        .map((m) => {
                          const dept =
                            typeof m.primaryDepartmentId === 'object' &&
                            m.primaryDepartmentId !== null
                              ? (m.primaryDepartmentId as any)
                              : null;
                          return dept?._id?.toString() || dept?.id || null;
                        })
                        .filter(Boolean),
                    ).size
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">Departments</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}