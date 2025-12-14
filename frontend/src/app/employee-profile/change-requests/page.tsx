// ./src/app/employee-profile/change-requests/page.tsx


"use client";

import { useEffect, useState } from "react";
import {api} from "@/lib/axios";
import {
  EmployeeProfileChangeRequest,
  ProfileChangeStatus,
} from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";

const statuses: (ProfileChangeStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELED",
];

export default function ChangeRequestsListPage() {
  const [statusFilter, setStatusFilter] = useState<ProfileChangeStatus | "ALL">(
    "ALL"
  );
  const [items, setItems] = useState<EmployeeProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const params =
        statusFilter === "ALL" ? {} : { status: statusFilter.toString() };

      const res = await api.get<EmployeeProfileChangeRequest[]>(
        "/employee-profile/change-requests",
        { params }
      );

      setItems(res.data);
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to load change requests.";
      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <main className="page">
      <div className="card">
        <BackButton />

        <h1>Employee Profile Change Requests (HR)</h1>
        <p className="text-muted">
          HR can review all submitted profile change requests and filter by
          status (Pending, Approved, Rejected, or Canceled).
        </p>

        <div className="toolbar">
          <div className="field">
            <label>Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ProfileChangeStatus | "ALL")
              }
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button onClick={loadData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <p className="error">Error: {error}</p>}
        {loading && !error && <p>Loading change requests...</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-muted">No change requests found.</p>
        )}

        {items.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee Profile ID</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cr) => (
                  <tr key={cr._id}>
                    <td>{cr.requestId}</td>
                    <td>{cr.employeeProfileId}</td>
                    <td> 
                      <StatusBadge kind="changeRequest" value={cr.status} />
                    </td>
                    <td>
                      {cr.submittedAt
                        ? new Date(cr.submittedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
