'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { positionsService } from '@/services/api/positions.service';
import { useDepartments } from '@/hooks/useDepartments';
import { Position, UpdatePositionDTO, DelimitPositionDTO } from '@/types/position.types';
import { formatDate } from '@/lib/utils';

export default function PositionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { departments } = useDepartments();

  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePositionDTO>({});

  useEffect(() => {
    if (id) {
      fetchPosition();
    }
  }, [id]);

  const fetchPosition = async () => {
    try {
      const data = await positionsService.getPositionById(id);
      setPosition(data);
      setFormData({
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        reportsTo: data.reportsTo,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load position');
    } finally {
      setIsLoading(false);
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

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this position?')) return;
    try {
      await positionsService.deactivatePosition(id);
      fetchPosition();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate position');
    }
  };

  const handleDelimit = async () => {
    const date = prompt('Enter delimit date (YYYY-MM-DD):');
    if (!date) return;
    try {
      const data: DelimitPositionDTO = { delimitDate: date };
      await positionsService.delimitPosition(id, data);
      fetchPosition();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delimit position');
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading position..." />;
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
                    Department
                  </label>
                  <select
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
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
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{position.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        position.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {position.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600">{position.description || 'No description'}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Department:</span>{' '}
                      {position.department?.name}
                    </p>
                    {position.reportsToPosition && (
                      <p className="text-sm">
                        <span className="font-medium">Reports to:</span>{' '}
                        {position.reportsToPosition.title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setIsEditing(true)}>Edit Position</Button>
                  {position.isActive && (
                    <>
                      <Button variant="secondary" onClick={handleDelimit}>
                        Delimit Position
                      </Button>
                      <Button variant="danger" onClick={handleDeactivate}>
                        Deactivate
                      </Button>
                    </>
                  )}
                </div>
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
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{position.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              {position.delimitDate && (
                <div>
                  <p className="text-sm text-gray-500">Delimit Date</p>
                  <p className="text-gray-900">{formatDate(position.delimitDate)}</p>
                </div>
              )}
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