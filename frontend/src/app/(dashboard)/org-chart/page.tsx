'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { employeesService } from '@/services/api/employees.service';
import { PositionNode } from '@/types/organization.types';
import PositionNodeComponent from '@/components/org-chart/PositionNode';
import { useAuth } from '@/hooks/useAuth';

export default function OrgChartPage() {
  const [nodes, setNodes] = useState<PositionNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await employeesService.getPositionHierarchy();
      setNodes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organizational hierarchy');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBasedMessage = (): string | null => {
    if (!user?.role) return null;

    const role = user.role.toLowerCase();
    if (role === 'department head' || role === 'department employee') {
      return 'You are viewing your team\'s organizational structure. This view is automatically filtered to show only positions in your department.';
    }
    if (role === 'hr manager' || role === 'hr admin' || role === 'system admin') {
      return 'You are viewing the complete organizational hierarchy.';
    }
    return null;
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading organizational chart..." />;
  }

  const roleMessage = getRoleBasedMessage();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600 mt-1">
            Position-based organizational hierarchy. Positions may be vacant or assigned to employees.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {roleMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">{roleMessage}</p>
        </div>
      )}

      <Card>
        {nodes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg font-medium">No organizational structure configured yet.</p>
            <p className="text-sm mt-2">
              Create active positions and set their <code>reportsToPositionId</code> to visualize the organization chart.
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Note: The hierarchy is position-based. Employees are displayed within their assigned positions.
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="flex justify-center min-w-max py-6">
              <div className="flex flex-col items-center gap-10">
                {nodes.map((root) => (
                  <PositionNodeComponent key={root.id} node={root} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


