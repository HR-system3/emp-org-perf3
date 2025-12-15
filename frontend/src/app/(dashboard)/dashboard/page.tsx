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
    <ProtectedRoute>
    <Card title="Dashboard" subtitle="Quick overview of Employee Profile module flows (self-service → manager insight → HR approvals).">
      {error && <ErrorMessage message={error} />}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Employees</div>
          <div className="metric-value">{employeesCount ?? "—"}</div>
          <div className="metric-trend">Directory size</div>
        </div>

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

      <div style={{ marginTop: 16 }} className="text-muted">
        ✅ Self-service updates (email/phone/address/biography) • ✅ Submit change request • ✅ HR list + approve/reject • ✅ Manager team view (demo)
      </div>
    </Card>
    </ProtectedRoute>
  );
}
