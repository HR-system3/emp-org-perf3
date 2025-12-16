'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { positionsService } from '@/services/api/positions.service';
import { departmentsService } from '@/services/api/departments.service';
import { Position, UpdatePositionDTO } from '@/types/position.types';
import { Department } from '@/types/department.types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function PositionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [position, setPosition] = useState<Position | null>(null);
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePositionDTO>({});
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPosition();
    fetchAllPositions();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPosition = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await positionsService.getPositionById(id);
      setPosition(data);
      setFormData({
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        reportsToPositionId: data.reportsToPositionId || null,
      });

      // Check if Department Head/Employee is trying to view position from another department
      const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
      const isDepartmentHead = normalizedRole === 'department head';
      const isDepartmentEmployee = normalizedRole === 'department employee';

      if ((isDepartmentHead || isDepartmentEmployee) && user?.departmentId && data.departmentId !== user.departmentId) {
        setIsForbidden(true);
        setError('You are not allowed to view this position. It belongs to another department.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load position');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPositions = async () => {
    try {
      const data = await positionsService.getAllPositions();
      setAllPositions(data);
    } catch (err) {
      console.error('Failed to load positions');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await positionsService.updatePosition(id, formData);
      setIsEditing(false);
      fetchPosition();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update position');
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading position..." />;
  }

  if (isForbidden) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You are not allowed to view this position. It belongs to another department." />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (error && !position) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message={error} />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!position) return null;

  const canUpdate = hasPermission(user?.role || '', 'canUpdatePositions');
  const department = departments.find((d) => d.id === position.departmentId);
  const reportsToPosition = allPositions.find((p) => p.id === position.reportsToPositionId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Positions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Position Information">
            {error && (
              <div className="mb-4">
                <ErrorMessage message={error} onDismiss={() => setError('')} />
              </div>
            )}

            {isEditing ? (
              canUpdate ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.departmentId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, departmentId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reports To (manager position)
                    </label>
                    <select
                      value={formData.reportsToPositionId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reportsToPositionId: e.target.value || null,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No manager (top-level)</option>
                      {allPositions
                        .filter((p) => p.id !== position.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.code})
                          </option>
                        ))}
                    </select>
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
                  You do not have permission to edit this position.
                </p>
              )
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h2>
                  <p className="text-gray-600">{position.description || 'No description'}</p>
                </div>
                {canUpdate && (
                  <Button onClick={() => setIsEditing(true)}>Edit Position</Button>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Position ID</p>
                <p className="font-mono text-sm text-gray-900">{position.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Position ID</p>
                <p className="font-mono text-sm text-gray-900">{position.positionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <p className="text-gray-900">{position.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-gray-900">
                  {department ? `${department.name} (${department.code})` : position.departmentId}
                </p>
              </div>
              {reportsToPosition && (
                <div>
                  <p className="text-sm text-gray-500">Reports To</p>
                  <p className="text-gray-900">
                    {reportsToPosition.title} ({reportsToPosition.code})
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {position.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    position.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {position.isActive ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cost Center</p>
                <p className="text-gray-900">{position.costCenter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">{formatDate(position.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(position.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
