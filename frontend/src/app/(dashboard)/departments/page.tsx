'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { departmentsService } from '@/services/api/departments.service';
import { Department } from '@/types/department.types';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { formatDate } from '@/lib/utils';

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await departmentsService.getAllDepartments();
      const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
      const isDepartmentHead = normalizedRole === 'department head';
      const isDepartmentEmployee = normalizedRole === 'department employee';

      if (isDepartmentHead || isDepartmentEmployee) {
        // For scoped roles, fetch their profile to get departmentId and filter.
        const profile = await api.get('/employee-profile/me/self').then((r) => r.data);
        const myDeptId =
          (profile?.primaryDepartmentId && typeof profile.primaryDepartmentId === 'object'
            ? profile.primaryDepartmentId._id || profile.primaryDepartmentId.id || profile.primaryDepartmentId
            : profile?.primaryDepartmentId) || '';
        const scoped = myDeptId ? data.filter((dept) => dept.id === myDeptId) : [];
        setDepartments(scoped);
      } else {
        setDepartments(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading departments..." />;
  }

  const canCreate = hasPermission(user?.role || '', 'canCreateDepartments');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-2">View all departments in the organization</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push('/departments/new')}>
            + Create Department
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {departments.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No departments found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              onClick={() => router.push(`/departments/${dept.id}`)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {dept.description || 'No description provided'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Code: {dept.code}</span>
                    {dept.positionsCount !== undefined && (
                      <span>💼 {dept.positionsCount} positions</span>
                    )}
                  </div>
                </div>
                <div className="text-2xl">🏢</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {formatDate(dept.createdAt)}</span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      dept.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
