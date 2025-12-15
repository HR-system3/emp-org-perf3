// ./src/app/(dashboard)/dashboard/page.tsx 

"use client";

import { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import ErrorMessage from "@/components/common/ErrorMessage";
import { listEmployees } from "@/services/api/employees.service";
import { listChangeRequests } from "@/services/api/changeRequests.service";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const [employeesCount, setEmployeesCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [emps, pending] = await Promise.all([listEmployees(), listChangeRequests("PENDING")]);
      setEmployeesCount(emps.length);
      setPendingCount(pending.length);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load dashboard metrics.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of Organization Structure, Employee Profiles, and Performance
        </p>
      </div>
    <ProtectedRoute>
    <Card title="Dashboard" subtitle="Quick overview of Employee Profile module flows (self-service → manager insight → HR approvals).">
      {error && <ErrorMessage message={error} />}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Employees</div>
          <div className="metric-value">{employeesCount ?? "—"}</div>
          <div className="metric-trend">Directory size</div>
        </div>

      {/* Top summary stats - Organization */}
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
        <div className="metric-card">
          <div className="metric-label">Pending change requests</div>
          <div className="metric-value">{pendingCount ?? "—"}</div>
          <div className="metric-trend">HR approval queue</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">What’s implemented</div>
          <div className="metric-value">Employee Profile</div>
          <div className="metric-trend">Other modules are placeholders</div>
        </div>
      </div>

      {/* Three domain sections: Organization, Employee Profile, Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization Structure Section */}
        <Card title="Organization Structure">
          <div className="space-y-3">
            <Link
              href={ROUTES.DEPARTMENTS}
              className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Manage Departments</h4>
              <p className="text-sm text-blue-700">Create and update departments</p>
            </Link>
            <Link
              href={ROUTES.POSITIONS}
              className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <h4 className="font-medium text-indigo-900">Manage Positions</h4>
              <p className="text-sm text-indigo-700">Create, delimit, and deactivate positions</p>
            </Link>
            <Link
              href={ROUTES.ORG_CHART}
              className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">View Org Chart</h4>
              <p className="text-sm text-green-700">Visualize hierarchy</p>
            </Link>
            <Link
              href={ROUTES.CHANGE_REQUESTS}
              className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <h4 className="font-medium text-yellow-900">Change Requests</h4>
              <p className="text-sm text-yellow-700">Submit and approve structural changes</p>
            </Link>
          </div>
        </Card>

        {/* Employee Profile Section */}
        <Card title="Employee Profile">
          <div className="space-y-3">
            <Link
              href="/employee-profile/new"
              className="block p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <h4 className="font-medium text-emerald-900">Create Employee</h4>
              <p className="text-sm text-emerald-700">Create employee master record</p>
            </Link>
            <Link
              href="/employee-profile/search-by-number"
              className="block p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <h4 className="font-medium text-teal-900">Search Employee</h4>
              <p className="text-sm text-teal-700">Find employees by number</p>
            </Link>
            <Link
              href="/employee-profile/change-requests"
              className="block p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <h4 className="font-medium text-sky-900">Profile Change Requests</h4>
              <p className="text-sm text-sky-700">Review profile update requests</p>
            </Link>
            <Link
              href="/employee-profile/manager-team-demo"
              className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">Manager Team View</h4>
              <p className="text-sm text-purple-700">View your team’s profiles</p>
            </Link>
          </div>
        </Card>

        {/* Performance Management Section */}
        <Card title="Performance Management">
          <div className="space-y-3">
            <Link
              href="/performance/templates"
              className="block p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <h4 className="font-medium text-pink-900">Appraisal Templates</h4>
              <p className="text-sm text-pink-700">Define templates and criteria</p>
            </Link>
            <Link
              href="/performance/cycles"
              className="block p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <h4 className="font-medium text-rose-900">Appraisal Cycles</h4>
              <p className="text-sm text-rose-700">Plan and monitor cycles</p>
            </Link>
            <Link
              href="/performance/records"
              className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <h4 className="font-medium text-orange-900">Appraisal Records</h4>
              <p className="text-sm text-orange-700">Manager and employee appraisals</p>
            </Link>
            <Link
              href="/performance/disputes"
              className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <h4 className="font-medium text-red-900">Disputes</h4>
              <p className="text-sm text-red-700">Track and resolve appraisal disputes</p>
            </Link>
          </div>
        </Card>
      <div style={{ marginTop: 16 }} className="text-muted">
        ✅ Self-service updates (email/phone/address/biography) • ✅ Submit change request • ✅ HR list + approve/reject • ✅ Manager team view (demo)
      </div>
    </Card>
    </ProtectedRoute>
  );
}
