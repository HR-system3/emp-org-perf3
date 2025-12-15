//./frontend/src/components/departments/DepartmentCard.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import { Department } from '@/types/department.types';
import { formatDate } from '@/lib/utils';

interface DepartmentCardProps {
  department: Department;
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const router = useRouter();

  return (
    <Card onClick={() => router.push(`/departments/${department.id}`)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{department.name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {department.description || 'No description provided'}
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>👥 {department.employeesCount || 0} employees</span>
            <span>💼 {department.positionsCount || 0} positions</span>
          </div>
        </div>
        <div className="text-2xl">🏢</div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Created {formatDate(department.createdAt)}
      </div>
    </Card>
  );
}