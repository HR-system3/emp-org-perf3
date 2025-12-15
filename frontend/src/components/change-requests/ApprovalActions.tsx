//.src/components/change-requests/ApprovalActions.tsx 

"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import { EmployeeProfileChangeRequest, ProfileChangeStatus } from "@/types/employeeProfile";
import { processChangeRequest } from "@/services/api/changeRequests.service";

const statuses: ProfileChangeStatus[] = ["APPROVED", "REJECTED", "CANCELED", "PENDING"];

export default function ApprovalActions({
  requestId,
  onUpdated,
}: {
  requestId: string;
  onUpdated?: (cr: EmployeeProfileChangeRequest) => void;
}) {
  const [status, setStatus] = useState<ProfileChangeStatus>("APPROVED");
  const [appliedChanges, setAppliedChanges] = useState('{\n  "status": "ACTIVE"\n}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProcess() {
    setLoading(true);
    setError(null);
    try {
      const payload: any = { status };
      if (status === "APPROVED" && appliedChanges.trim()) {
        payload.appliedChanges = JSON.parse(appliedChanges);
      }
      const updated = await processChangeRequest(requestId, payload);
      onUpdated?.(updated);
    } catch (err: any) {
      const msg =
        err instanceof SyntaxError
          ? "Invalid JSON in appliedChanges."
          : err?.response?.data?.message || err?.message || "Failed to process request.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      <div className="form-row">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Applied Changes (JSON) — used only when APPROVED</label>
        <textarea value={appliedChanges} onChange={(e) => setAppliedChanges(e.target.value)} rows={6} />
      </div>

      {error && <ErrorMessage message={error} />}

      <Button onClick={handleProcess} disabled={loading} type="button">
        {loading ? "Processing..." : "Process Request"}
      </Button>
    </div>
  );
}
