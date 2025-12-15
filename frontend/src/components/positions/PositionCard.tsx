// ./src/frontend/src/components/positions/PositionCard.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import { Position } from '@/types/position.types';
import { formatDate } from '@/lib/utils';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const router = useRouter();

  return (
    <Card onClick={() => router.push(`/positions/${position.id}`)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
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
            <div>🏢 {position.departmentId || 'Unknown Department'}</div>
            {(position as any).reportsToPositionId && (
              <div>👤 Reports to: {(position as any).reportsToPositionId}</div>
            )}
          </div>
        </div>
        <div className="text-2xl">💼</div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Created {formatDate(position.createdAt)}
      </div>
    </Card>
  );
}