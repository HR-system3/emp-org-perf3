// ./src/app/employee-profile/change-requests/process/page.tsx


"use client";

import { useState, FormEvent } from "react";
import {api} from "@/lib/axios";
import {
  EmployeeProfileChangeRequest,
  ProfileChangeStatus,
} from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const statuses: ProfileChangeStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELED",
];

export default function ProcessChangeRequestPage() {
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState<ProfileChangeStatus>("APPROVED");
  const [appliedChanges, setAppliedChanges] = useState(
    '{\n  "status": "ACTIVE"\n}'
  );
  const [result, setResult] = useState<EmployeeProfileChangeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsed: Record<string, any> | undefined = undefined;

      if (appliedChanges.trim() && status === "APPROVED") {
        parsed = JSON.parse(appliedChanges);
      }

      const payload = {
        status,
        appliedChanges: parsed,
      };

      const res = await api.patch<EmployeeProfileChangeRequest>(
        `/employee-profile/change-requests/${requestId}`,
        payload
      );
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError("Invalid JSON in appliedChanges.");
      } else {
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to process request.";
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : JSON.stringify(backendMessage)
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowRoles={["HR", "Admin"]}>
    <main className="page">
      <div className="card">
        <BackButton />

        <h1>Process Change Request (HR Demo)</h1>
        <p className="text-muted">
          Enter a <strong>Request ID</strong> from the change requests list, set
          the new status, and (optionally) provide a JSON payload with the
          fields that should be applied to the employee profile when the request
          is approved.
        </p>

        {error && <p className="error">Error: {error}</p>}

        <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem" }}>
          <div className="form-grid">
            <div className="form-row">
              <label>Request ID *</label>
              <input
                placeholder="e.g. ECR-1733..."
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>Status *</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ProfileChangeStatus)
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "1rem" }}>
            <label>
              Applied Changes (JSON, used only when status is{" "}
              <strong>APPROVED</strong>)
            </label>
            <textarea
              rows={6}
              value={appliedChanges}
              onChange={(e) => setAppliedChanges(e.target.value)}
              placeholder={`{\n  "status": "INACTIVE"\n}`}
            />
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Process Request"}
            </button>
          </div>
        </form>

        {result && (
          <div className="result-block">
            <h2 style={{ marginBottom: "0.6rem" }}>Updated Request</h2>
            <p style={{ marginBottom: "0.5rem" }}>
              Status:{" "}
              <StatusBadge kind="changeRequest" value={result.status} />
            </p>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
    </ProtectedRoute>
  );
}
