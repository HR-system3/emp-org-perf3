//.src/components/change-requests/ChangeRequestList.tsx 

"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import { EmployeeProfileChangeRequest, ProfileChangeStatus } from "@/types/employeeProfile";
import { listChangeRequests } from "@/services/api/changeRequests.service";

const statuses: Array<ProfileChangeStatus | "ALL"> = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELED"];

export default function ChangeRequestList({
  showEmployeeId = true,
  onSelect,
}: {
  showEmployeeId?: boolean;
  onSelect?: (cr: EmployeeProfileChangeRequest) => void;
}) {
  const [filter, setFilter] = useState<ProfileChangeStatus | "ALL">("ALL");
  const [items, setItems] = useState<EmployeeProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listChangeRequests(filter === "ALL" ? undefined : filter);
      setItems(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load change requests.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div style={{ marginTop: 14 }}>
      <div className="toolbar" style={{ display: "flex", gap: 12, alignItems: "end" }}>
        <div className="field" style={{ minWidth: 220 }}>
          <label>Status Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={load} type="button" variant="ghost" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              {showEmployeeId && <th>Employee</th>}
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {items.map((cr) => (
              <tr key={cr._id} onClick={() => onSelect?.(cr)} style={{ cursor: onSelect ? "pointer" : "default" }}>
                <td>{cr.requestId}</td>
                {showEmployeeId && <td>{cr.employeeProfileId}</td>}
                <td>
                  <StatusBadge kind="changeRequest" value={cr.status} />
                </td>
                <td>{cr.submittedAt ? new Date(cr.submittedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={showEmployeeId ? 4 : 3} className="text-muted">
                  No change requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
