'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import {
  EmployeeProfile,
  EmployeeProfileChangeRequest,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

type EmployeesOverview = {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
};

type ChangeRequestsOverview = {
  pending: number;
  approved: number;
  rejected: number;
};

export default function EmployeeProfileHomePage() {
  const { user } = useAuth();
  const [employeesOverview, setEmployeesOverview] =
    useState<EmployeesOverview | null>(null);
  const [changeOverview, setChangeOverview] =
    useState<ChangeRequestsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setError(null);

    try {
      // ----- Employees -----
      const employeesRes = await api.get<EmployeeProfile[]>('/employee-profile');
      const employees = employeesRes.data;

      const empSummary: EmployeesOverview = {
        total: employees.length,
        active: employees.filter((e) => e.status === 'ACTIVE').length,
        onLeave: employees.filter((e) => e.status === 'ON_LEAVE').length,
        terminated: employees.filter((e) => e.status === 'TERMINATED').length,
      };
      setEmployeesOverview(empSummary);

      // ----- Change requests -----
      const crRes = await api.get<EmployeeProfileChangeRequest[]>(
        '/employee-profile/change-requests'
      );
      const cr = crRes.data;

      const crSummary: ChangeRequestsOverview = {
        pending: cr.filter((c) => c.status === 'PENDING').length,
        approved: cr.filter((c) => c.status === 'APPROVED').length,
        rejected: cr.filter((c) => c.status === 'REJECTED').length,
      };
      setChangeOverview(crSummary);
    } catch (err: any) {
      console.error(err);
      // Don't show error if it's an authentication error (401) - the interceptor will redirect
      if (err?.response?.status === 401) {
        setLoading(false);
        return;
      }
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to load overview data.';
      setError(
        typeof backendMessage === 'string'
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage employee profiles, create new employees, and review profile change requests.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-2">👥</div>
            <h3 className="text-2xl font-bold text-gray-900">
              {employeesOverview ? employeesOverview.total : '—'}
            </h3>
            <p className="text-gray-600">Total Employees</p>
            <div className="mt-2 text-sm text-gray-500">
              {employeesOverview ? employeesOverview.active : '—'} active ·{' '}
              {employeesOverview ? employeesOverview.onLeave : '—'} on leave ·{' '}
              {employeesOverview ? employeesOverview.terminated : '—'} terminated
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-2">📝</div>
            <h3 className="text-2xl font-bold text-yellow-600">
              {changeOverview ? changeOverview.pending : '—'}
            </h3>
            <p className="text-gray-600">Pending Requests</p>
            <div className="mt-2 text-sm text-gray-500">
              {changeOverview ? changeOverview.approved : '—'} approved ·{' '}
              {changeOverview ? changeOverview.rejected : '—'} rejected
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <Button onClick={loadOverview} disabled={loading} size="sm">
              {loading ? 'Refreshing…' : 'Refresh Data'}
            </Button>
            <p className="text-gray-600 mt-4 text-sm">
              Update overview statistics
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Management Section */}
        {(hasPermission(user?.role || '', 'canCreateEmployee') || 
          hasPermission(user?.role || '', 'canSearchEmployee') || 
          hasPermission(user?.role || '', 'canViewAllEmployees') || 
          hasPermission(user?.role || '', 'canViewSelfService') || 
          hasPermission(user?.role || '', 'canViewManagerTeam')) && (
          <Card title="Employee Management">
            <div className="space-y-3">
              {hasPermission(user?.role || '', 'canCreateEmployee') && (
                <Link
                  href="/employee-profile/new"
                  className="block p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <h4 className="font-medium text-emerald-900">Create Employee Profile</h4>
                  <p className="text-sm text-emerald-700">
                    Onboard a new employee with personal, contract, and organizational info.
                  </p>
                </Link>
              )}

              {hasPermission(user?.role || '', 'canSearchEmployee') && (
                <Link
                  href="/employee-profile/search-by-number"
                  className="block p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <h4 className="font-medium text-teal-900">Search Employee by Number</h4>
                  <p className="text-sm text-teal-700">
                    Quickly look up an existing employee using their employee number.
                  </p>
                </Link>
              )}

              {hasPermission(user?.role || '', 'canViewAllEmployees') && (
                <Link
                  href="/employee-profile/employees"
                  className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h4 className="font-medium text-blue-900">Employees Directory</h4>
                  <p className="text-sm text-blue-700">
                    Browse all employees in the system, filter by name/number/status.
                  </p>
                </Link>
              )}

              {hasPermission(user?.role || '', 'canViewSelfService') && (
                <Link
                  href="/employee-profile/self-demo"
                  className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h4 className="font-medium text-purple-900">Self-Service Profile</h4>
                  <p className="text-sm text-purple-700">
                    Employee self-service screen for viewing and editing their own profile.
                  </p>
                </Link>
              )}

              {hasPermission(user?.role || '', 'canViewManagerTeam') && (
                <Link
                  href="/employee-profile/manager-team-demo"
                  className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <h4 className="font-medium text-indigo-900">Manager Team View</h4>
                  <p className="text-sm text-indigo-700">
                    View direct reports and basic team information for a manager.
                  </p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Change Requests Section */}
        {(hasPermission(user?.role || '', 'canViewChangeRequests') || 
          hasPermission(user?.role || '', 'canProcessChangeRequests')) && (
          <Card title="Change Requests">
            <div className="space-y-3">
              {hasPermission(user?.role || '', 'canViewChangeRequests') && (
                <Link
                  href="/employee-profile/change-requests"
                  className="block p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <h4 className="font-medium text-sky-900">List Change Requests</h4>
                  <p className="text-sm text-sky-700">
                    Review all submitted profile change requests and filter by status.
                  </p>
                </Link>
              )}

              {hasPermission(user?.role || '', 'canProcessChangeRequests') && (
                <Link
                  href="/employee-profile/change-requests/process"
                  className="block p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  <h4 className="font-medium text-cyan-900">Process Change Request</h4>
                  <p className="text-sm text-cyan-700">
                    Process a specific change request by Request ID and update status.
                  </p>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}