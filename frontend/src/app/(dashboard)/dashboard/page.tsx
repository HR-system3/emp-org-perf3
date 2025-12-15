// ./src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/common/Card";
import ErrorMessage from "@/components/common/ErrorMessage";
import { listEmployees } from "@/services/api/employees.service";
import { listChangeRequests } from "@/services/api/changeRequests.service";

export default function DashboardPage() {
  const [employeesCount, setEmployeesCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [emps, pending] = await Promise.all([
        listEmployees(),
        listChangeRequests("PENDING"),
      ]);
      setEmployeesCount(emps.length);
      setPendingCount(pending.length);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dashboard metrics.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of Organization Structure, Employee Profiles, and Performance
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/dashboard/employee-profiles" className="block">
            <div className="text-center">
              <div className="text-5xl mb-2">👥</div>
              <h3 className="text-2xl font-bold text-gray-900">
                {employeesCount ?? "—"}
              </h3>
              <p className="text-gray-600">Employees</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/dashboard/change-requests" className="block">
            <div className="text-center">
              <div className="text-5xl mb-2">📝</div>
              <h3 className="text-2xl font-bold text-yellow-600">
                {pendingCount ?? "—"}
              </h3>
              <p className="text-gray-600">Pending Requests</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/dashboard/org-chart" className="block">
            <div className="text-center">
              <div className="text-5xl mb-2">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900">Org</h3>
              <p className="text-gray-600">Organization Chart</p>
            </div>
          </Link>
        </Card>
      </div>

      <Card title="Quick Links" subtitle="Jump into the implemented flows.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100" href="/dashboard/departments">
            Manage Departments
          </Link>
          <Link className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100" href="/dashboard/positions">
            Manage Positions
          </Link>
          <Link className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100" href="/dashboard/change-requests">
            Change Requests
          </Link>
          <Link className="block p-3 bg-green-50 rounded-lg hover:bg-green-100" href="/dashboard/org-chart">
            View Org Chart
          </Link>
        </div>

        <div style={{ marginTop: 16 }} className="text-muted">
          ✅ Submit change request • ✅ HR list + approve/reject • ✅ Organization pages
        </div>
      </Card>
    </div>
  );
}