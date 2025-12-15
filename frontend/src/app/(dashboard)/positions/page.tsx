'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { positionsService } from '@/services/api/positions.service';
import { useDepartments } from '@/hooks/useDepartments';
import { Position, CreatePositionDTO } from '@/types/position.types';
import { formatDate } from '@/lib/utils';

export default function PositionsPage() {
  const router = useRouter();
  const { departments, isLoading: deptsLoading, error: deptsError } = useDepartments();

  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePositionDTO>({
    positionId: '',
    code: '',
    title: '',
    description: '',
    jobKey: '',
    departmentId: '',
    payGradeId: '',
    reportsToPositionId: '',
    status: undefined,
    costCenter: '',
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await positionsService.getAllPositions();
      setPositions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.positionId.trim() ||
      !createForm.code.trim() ||
      !createForm.title.trim() ||
      !createForm.jobKey.trim() ||
      !createForm.departmentId ||
      !createForm.payGradeId.trim() ||
      !createForm.costCenter.trim()
    ) {
      setError(
        'Position ID, code, title, job key, department, pay grade, and cost center are required',
      );
      return;
    }

    try {
      setError(null);
      await positionsService.createPosition({
        positionId: createForm.positionId.trim(),
        code: createForm.code.trim(),
        title: createForm.title.trim(),
        description: createForm.description?.trim() || undefined,
        jobKey: createForm.jobKey.trim(),
        departmentId: createForm.departmentId,
        payGradeId: createForm.payGradeId.trim(),
        reportsToPositionId: createForm.reportsToPositionId || undefined,
        status: createForm.status,
        costCenter: createForm.costCenter.trim(),
      });
      setIsCreating(false);
      setCreateForm({
        positionId: '',
        code: '',
        title: '',
        description: '',
        jobKey: '',
        departmentId: '',
        payGradeId: '',
        reportsToPositionId: '',
        status: undefined,
        costCenter: '',
      });
      loadPositions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create position');
    }
  };

  if (isLoading || deptsLoading) {
    return <Loading size="lg" text="Loading positions..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-600 mt-1">
            Manage positions within the Organization Structure module.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>+ New Position</Button>
      </div>

      {(error || deptsError) && (
        <ErrorMessage message={error || deptsError || 'An error occurred'} onDismiss={() => setError(null)} />
      )}

      {isCreating && (
        <Card title="Create Position">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position ID *
                </label>
                <input
                  type="text"
                  value={createForm.positionId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, positionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. POS-001"
                  required
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
                  placeholder="e.g. HR-MGR"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Senior HR Specialist"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Key *
              </label>
              <input
                type="text"
                value={createForm.jobKey}
                onChange={(e) =>
                  setCreateForm({ ...createForm, jobKey: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. HR-MGR-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                value={createForm.departmentId}
                onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
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
                placeholder="Optional description of the position"
              />
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Grade ID *
                  </label>
                  <input
                    type="text"
                    value={createForm.payGradeId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, payGradeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Link to Payroll Pay Grade ID"
                    required
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reports To (Position ID, optional)
              </label>
              <input
                type="text"
                value={createForm.reportsToPositionId}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    reportsToPositionId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Manager position document ID"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create Position</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Position List">
        {positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No positions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((pos) => (
                  <tr
                    key={pos.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/positions/${pos.id}`)}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {pos.title}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {pos.department?.name || '—'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pos.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pos.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatDate(pos.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/positions/${pos.id}`);
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


