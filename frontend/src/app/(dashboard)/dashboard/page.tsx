'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { departmentsService } from '@/services/api/departments.service';
import { positionsService } from '@/services/api/positions.service';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function DashboardPage() {
  const { user } = useAuth();
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
        <p className="text-gray-600 mt-2">
          Overview of Organization Structure, Employee Profiles, and Performance
        </p>
      </div>

      {/* Top summary stats - Organization */}
      {(hasPermission(user?.role || '', 'canViewDepartments') || 
        hasPermission(user?.role || '', 'canViewPositions') || 
        hasPermission(user?.role || '', 'canViewChangeRequests')) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {hasPermission(user?.role || '', 'canViewDepartments') && (
            <Card className="hover:shadow-lg transition-shadow">
              <Link href={ROUTES.DEPARTMENTS}>
                <div className="text-center">
                  <div className="text-5xl mb-2">🏢</div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.departments}</h3>
                  <p className="text-gray-600">Departments</p>
                </div>
              </Link>
            </Card>
          )}

          {hasPermission(user?.role || '', 'canViewPositions') && (
            <Card className="hover:shadow-lg transition-shadow">
              <Link href={ROUTES.POSITIONS}>
                <div className="text-center">
                  <div className="text-5xl mb-2">💼</div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.positions}</h3>
                  <p className="text-gray-600">Positions</p>
                </div>
              </Link>
            </Card>
          )}

          {hasPermission(user?.role || '', 'canViewChangeRequests') && (
            <Card className="hover:shadow-lg transition-shadow">
              <Link href={ROUTES.CHANGE_REQUESTS}>
                <div className="text-center">
                  <div className="text-5xl mb-2">📝</div>
                  <h3 className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</h3>
                  <p className="text-gray-600">Pending Requests</p>
                </div>
              </Link>
            </Card>
          )}
        </div>
      )}

      {/* Three domain sections: Organization, Employee Profile, Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization Structure Section */}
        {(hasPermission(user?.role || '', 'canViewDepartments') || 
          hasPermission(user?.role || '', 'canViewPositions') || 
          hasPermission(user?.role || '', 'canViewOrgChart') || 
          hasPermission(user?.role || '', 'canViewChangeRequests')) && (
          <Card title="Organization Structure">
            <div className="space-y-3">
              {hasPermission(user?.role || '', 'canViewDepartments') && (
                <Link
                  href={ROUTES.DEPARTMENTS}
                  className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h4 className="font-medium text-blue-900">Manage Departments</h4>
                  <p className="text-sm text-blue-700">Create and update departments</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewPositions') && (
                <Link
                  href={ROUTES.POSITIONS}
                  className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <h4 className="font-medium text-indigo-900">Manage Positions</h4>
                  <p className="text-sm text-indigo-700">Create, delimit, and deactivate positions</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewOrgChart') && (
                <Link
                  href={ROUTES.ORG_CHART}
                  className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <h4 className="font-medium text-green-900">View Org Chart</h4>
                  <p className="text-sm text-green-700">Visualize hierarchy</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewChangeRequests') && (
                <Link
                  href={ROUTES.CHANGE_REQUESTS}
                  className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <h4 className="font-medium text-yellow-900">Change Requests</h4>
                  <p className="text-sm text-yellow-700">Submit and approve structural changes</p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Employee Profile Section */}
        {(hasPermission(user?.role || '', 'canCreateEmployee') || 
          hasPermission(user?.role || '', 'canSearchEmployee') || 
          hasPermission(user?.role || '', 'canViewChangeRequests') || 
          hasPermission(user?.role || '', 'canViewManagerTeam')) && (
          <Card title="Employee Profile">
            <div className="space-y-3">
              {hasPermission(user?.role || '', 'canCreateEmployee') && (
                <Link
                  href="/employee-profile/new"
                  className="block p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <h4 className="font-medium text-emerald-900">Create Employee</h4>
                  <p className="text-sm text-emerald-700">Create employee master record</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canSearchEmployee') && (
                <Link
                  href="/employee-profile/search-by-number"
                  className="block p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <h4 className="font-medium text-teal-900">Search Employee</h4>
                  <p className="text-sm text-teal-700">Find employees by number</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewChangeRequests') && (
                <Link
                  href="/employee-profile/change-requests"
                  className="block p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <h4 className="font-medium text-sky-900">Profile Change Requests</h4>
                  <p className="text-sm text-sky-700">Review profile update requests</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewManagerTeam') && (
                <Link
                  href="/employee-profile/manager-team-demo"
                  className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h4 className="font-medium text-purple-900">Manager Team View</h4>
                  <p className="text-sm text-purple-700">View your team's profiles</p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Performance Management Section */}
        {(hasPermission(user?.role || '', 'canViewTemplates') || 
          hasPermission(user?.role || '', 'canViewCycles') || 
          hasPermission(user?.role || '', 'canViewRecords') || 
          hasPermission(user?.role || '', 'canViewDisputes')) && (
          <Card title="Performance Management">
            <div className="space-y-3">
              {hasPermission(user?.role || '', 'canViewTemplates') && (
                <Link
                  href="/performance/templates"
                  className="block p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <h4 className="font-medium text-pink-900">Appraisal Templates</h4>
                  <p className="text-sm text-pink-700">Define templates and criteria</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewCycles') && (
                <Link
                  href="/performance/cycles"
                  className="block p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <h4 className="font-medium text-rose-900">Appraisal Cycles</h4>
                  <p className="text-sm text-rose-700">Plan and monitor cycles</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewRecords') && (
                <Link
                  href="/performance/records"
                  className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <h4 className="font-medium text-orange-900">Appraisal Records</h4>
                  <p className="text-sm text-orange-700">Manager and employee appraisals</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewDisputes') && (
                <Link
                  href="/performance/disputes"
                  className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <h4 className="font-medium text-red-900">Disputes</h4>
                  <p className="text-sm text-red-700">Track and resolve appraisal disputes</p>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}