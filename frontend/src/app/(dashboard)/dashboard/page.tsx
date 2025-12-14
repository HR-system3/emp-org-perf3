'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { departmentsService } from '@/services/api/departments.service';
import { positionsService } from '@/services/api/positions.service';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ROUTES } from '@/lib/constants';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    departments: 0,
    positions: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [departments, positions, changeRequests] = await Promise.all([
        departmentsService.getAllDepartments(),
        positionsService.getAllPositions(),
        changeRequestsService.getAllChangeRequests(),
      ]);

      setStats({
        departments: departments.length,
        positions: positions.length,
        pendingRequests: changeRequests.filter((cr) => cr.status === 'PENDING').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href={ROUTES.DEPARTMENTS}>
            <div className="text-center">
              <div className="text-5xl mb-2">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.departments}</h3>
              <p className="text-gray-600">Departments</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href={ROUTES.POSITIONS}>
            <div className="text-center">
              <div className="text-5xl mb-2">💼</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.positions}</h3>
              <p className="text-gray-600">Positions</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href={ROUTES.CHANGE_REQUESTS}>
            <div className="text-center">
              <div className="text-5xl mb-2">📝</div>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</h3>
              <p className="text-gray-600">Pending Requests</p>
            </div>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link
              href={ROUTES.SUBMIT_CHANGE_REQUEST}
              className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Submit Change Request</h4>
              <p className="text-sm text-blue-700">Request organizational changes</p>
            </Link>
            <Link
              href={ROUTES.ORG_CHART}
              className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">View Org Chart</h4>
              <p className="text-sm text-green-700">Visualize organization hierarchy</p>
            </Link>
            <Link
              href={ROUTES.MY_TEAM}
              className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">My Team</h4>
              <p className="text-sm text-purple-700">View your direct reports</p>
            </Link>
          </div>
        </Card>

        <Card title="System Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Departments</span>
              <span className="font-semibold text-gray-900">{stats.departments}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Positions</span>
              <span className="font-semibold text-gray-900">{stats.positions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Approvals</span>
              <span className="font-semibold text-yellow-600">{stats.pendingRequests}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}