'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { departmentsService } from '@/services/api/departments.service';
import { positionsService } from '@/services/api/positions.service';
import { Department, UpdateDepartmentDTO } from '@/types/department.types';
import { Position } from '@/types/position.types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { EmployeeProfile } from '@/types/employeeProfile';
import { api } from '@/lib/axios';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import Link from 'next/link';

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [department, setDepartment] = useState<Department | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateDepartmentDTO>({});
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (authLoading) return;

    // Department employees and department heads can only view their own department
    const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
    const isDepartmentEmployee = normalizedRole === 'department employee';
    const isDepartmentHead = normalizedRole === 'department head';

    if (isDepartmentEmployee || isDepartmentHead) {
      const enforce = async () => {
        try {
          const profile = await api.get('/employee-profile/me/self').then((r) => r.data);
          const myDeptId =
            (profile?.primaryDepartmentId && typeof profile.primaryDepartmentId === 'object'
              ? profile.primaryDepartmentId._id || profile.primaryDepartmentId.id || profile.primaryDepartmentId
              : profile?.primaryDepartmentId) || '';
          if (!myDeptId || myDeptId !== id) {
            setIsForbidden(true);
            setIsLoading(false);
            return;
          }
          fetchDepartment();
          fetchPositions();
          if (user && hasPermission(user.role || '', 'canViewAllEmployees')) {
            fetchEmployees();
          }
        } catch (err) {
          setIsForbidden(true);
          setIsLoading(false);
        }
      };
      enforce();
      return;
    }

    fetchDepartment();
    fetchPositions();
    // Only fetch employees if user has permission to view all employees
    if (user && hasPermission(user.role || '', 'canViewAllEmployees')) {
      fetchEmployees();
    }
  }, [id, authLoading, user]);

  const fetchDepartment = async () => {
    try {
      const data = await departmentsService.getDepartmentById(id);
      setDepartment(data);
      setFormData({ name: data.name, description: data.description });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load department');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const allPositions = await positionsService.getAllPositions();
      const deptPositions = allPositions.filter((p) => p.departmentId === id);
      setPositions(deptPositions);
    } catch (err) {
      console.error('Failed to load positions');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<EmployeeProfile[]>('/employee-profile', {
        params: { departmentId: id },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees for department', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await departmentsService.updateDepartment(id, formData);
      setIsEditing(false);
      fetchDepartment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update department');
    }
  };

  if (authLoading || isLoading) {
    return <Loading size="lg" text="Loading department..." />;
  }

  if (isForbidden) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You are not allowed to view this department. You can only view your own department." />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (error && !department) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message={error} />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!department) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Departments
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Department Information">
            {error && (
              <div className="mb-4">
                <ErrorMessage message={error} onDismiss={() => setError('')} />
              </div>
            )}

            {isEditing ? (
              hasPermission(user?.role || '', 'canUpdateDepartments') ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  You do not have permission to edit this department.
                </p>
              )
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{department.name}</h2>
                  <p className="text-gray-600">{department.description || 'No description'}</p>
                </div>
                {hasPermission(user?.role || '', 'canUpdateDepartments') && (
                  <Button onClick={() => setIsEditing(true)}>Edit Department</Button>
                )}
              </div>
            )}
          </Card>

          <Card title="Positions in this Department" className="mt-6">
            {positions.length === 0 ? (
              <p className="text-gray-500">No positions in this department</p>
            ) : (
              <div className="space-y-3">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    onClick={() => router.push(`/positions/${position.id}`)}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{position.title}</h4>
                        <p className="text-sm text-gray-600">{position.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          position.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {position.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {hasPermission(user?.role || '', 'canViewAllEmployees') && (
            <Card title="Department Employees" className="mt-6">
              {employees.length === 0 ? (
                <p className="text-gray-500">No employees in this department</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
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
                      {employees.map((emp) => {
                        const position = emp.primaryPositionId;
                        const positionTitle =
                          typeof position === 'object' && position !== null
                            ? (position as any).title || '—'
                            : '—';
                        return (
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
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {emp.employeeNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {positionTitle}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge kind="employee" value={emp.status} />
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>

        <div>
          <Card title="Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Department ID</p>
                <p className="font-mono text-sm text-gray-900">{department.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department Code</p>
                <p className="text-gray-900">{department.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cost Center</p>
                <p className="text-gray-900">{department.costCenter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">{formatDate(department.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(department.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Positions</p>
                <p className="text-2xl font-bold text-blue-600">{positions.length}</p>
              </div>
              {hasPermission(user?.role || '', 'canViewAllEmployees') && (
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
