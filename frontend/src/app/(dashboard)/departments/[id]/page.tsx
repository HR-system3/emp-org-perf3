// ./src/frontend/src/app/(dashboard)/departments/[id]/page.tsx

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

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateDepartmentDTO>({});

  useEffect(() => {
    if (id) {
      fetchDepartment();
      fetchPositions();
    }
  }, [id]);

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

  if (isLoading) {
    return <Loading size="lg" text="Loading department..." />;
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
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{department.name}</h2>
                  <p className="text-gray-600">{department.description || 'No description'}</p>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Department</Button>
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
        </div>

        <div>
          <Card title="Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Department ID</p>
                <p className="font-mono text-sm text-gray-900">{department.id}</p>
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}