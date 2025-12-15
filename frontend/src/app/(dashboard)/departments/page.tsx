'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { departmentsService } from '@/services/api/departments.service';
import { Department, CreateDepartmentDTO } from '@/types/department.types';
import { formatDate } from '@/lib/utils';

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDepartmentDTO>({
    deptId: '',
    code: '',
    name: '',
    description: '',
    headPositionId: '',
    costCenter: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await departmentsService.getAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.code.trim() || !createForm.name.trim() || !createForm.costCenter.trim()) {
      setError('Code, name, and cost center are required');
      return;
    }
    try {
      setError(null);
      await departmentsService.createDepartment({
        deptId: createForm.deptId?.trim() || undefined,
        code: createForm.code.trim(),
        name: createForm.name.trim(),
        description: createForm.description?.trim() || undefined,
        headPositionId: createForm.headPositionId || undefined,
        costCenter: createForm.costCenter.trim(),
      });
      setIsCreating(false);
      setCreateForm({
        deptId: '',
        code: '',
        name: '',
        description: '',
        headPositionId: '',
        costCenter: '',
      });
      loadDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading departments..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">
            Manage organizational departments as part of the Organization Structure module.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>+ New Department</Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {isCreating && (
        <Card title="Create Department">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department ID (optional)
                </label>
                <input
                  type="text"
                  value={createForm.deptId}
                  onChange={(e) => setCreateForm({ ...createForm, deptId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="If empty, system will generate (e.g. DEPT-001)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. HR"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Finance Department"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Optional description of the department"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Head Position ID (optional)
                </label>
                <input
                  type="text"
                  value={createForm.headPositionId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, headPositionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Position document ID for department head"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Center *
                </label>
                <input
                  type="text"
                  value={createForm.costCenter}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, costCenter: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. CC-HR-001"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Create Department</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Department List">
        {departments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No departments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/departments/${dept.id}`)}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {dept.description || '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatDate(dept.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatDate(dept.updatedAt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/departments/${dept.id}`);
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