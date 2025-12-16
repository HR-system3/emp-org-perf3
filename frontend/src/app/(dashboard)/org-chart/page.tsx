'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { employeesService } from '@/services/api/employees.service';
import { HierarchyNode } from '@/types/employee.types';
import OrgNode from '@/components/org-chart/OrgNode';

export default function OrgChartPage() {
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await employeesService.getHierarchy();
      setNodes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organizational hierarchy');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading organizational chart..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600 mt-1">
            Visualize the organizational hierarchy based on active positions and reporting lines.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        {nodes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg font-medium">No reporting lines configured yet.</p>
            <p className="text-sm mt-2">
              Create active positions and set their <code>reportsToPositionId</code> to visualize the organization chart.
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="flex justify-center min-w-max py-6">
              <div className="flex flex-col items-center gap-10">
                {nodes.map((root) => (
                  <OrgNode key={root.id} node={root} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


