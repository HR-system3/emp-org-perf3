'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { positionsService } from '@/services/api/positions.service';
import { Position } from '@/types/position.types';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { formatDate } from '@/lib/utils';

export default function PositionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPositions();
  }, [user]);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      setError('');
      const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
      const isDepartmentHead = normalizedRole === 'department head';
      const isDepartmentEmployee = normalizedRole === 'department employee';

      if (isDepartmentHead || isDepartmentEmployee) {
        const profile = await api.get('/employee-profile/me/self').then((r) => r.data);
        const myDeptId =
          (profile?.primaryDepartmentId && typeof profile.primaryDepartmentId === 'object'
            ? profile.primaryDepartmentId._id || profile.primaryDepartmentId.id || profile.primaryDepartmentId
            : profile?.primaryDepartmentId) || '';
        const data = await positionsService.getAllPositions(myDeptId || undefined);
        setPositions(data);
      } else {
        const data = await positionsService.getAllPositions();
        setPositions(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading positions..." />;
  }

  const canCreate = hasPermission(user?.role || '', 'canCreatePositions');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-600 mt-2">View all positions in the organization</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push('/positions/new')}>
            + Create Position
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {positions.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No positions found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((position) => (
            <Card
              key={position.id}
              onClick={() => router.push(`/positions/${position.id}`)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {position.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {position.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {position.description || 'No description provided'}
                  </p>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div>Code: {position.code}</div>
                    <div>Position ID: {position.positionId}</div>
                  </div>
                </div>
                <div className="text-2xl">💼</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {formatDate(position.createdAt)}</span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {position.status}
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
