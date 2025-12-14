//.src/components/change-requests/ChangeRequestForm.tsx 

"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import { ChangeRequestCategory, EmployeeProfileChangeRequest } from "@/types/employeeProfile";
import { submitChangeRequest } from "@/services/api/changeRequests.service";

const categories: ChangeRequestCategory[] = [
  "PERSONAL_INFORMATION",
  "JOB_INFORMATION",
  "ORGANIZATIONAL_ASSIGNMENT",
  "COMPENSATION_AND_BENEFITS",
  "OTHER",
];

export default function ChangeRequestForm({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated?: (cr: EmployeeProfileChangeRequest) => void;
}) {
  const [category, setCategory] = useState<ChangeRequestCategory>("PERSONAL_INFORMATION");
  const [reason, setReason] = useState("");
  const [requestedChanges, setRequestedChanges] = useState('{\n  "fieldName": "newValue"\n}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsed = requestedChanges.trim() ? JSON.parse(requestedChanges) : {};
      const cr = await submitChangeRequest(employeeId, {
        category,
        reason: reason || undefined,
        requestedChanges: parsed,
      });
      onCreated?.(cr);
    } catch (err: any) {
      const msg =
        err instanceof SyntaxError
          ? "Invalid JSON in requestedChanges."
          : err?.response?.data?.message || err?.message || "Failed to submit request.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
      <div className="form-row">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
          {categories.map((c) => (
            <option value={c} key={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
      </div>

      <div className="form-row">
        <label>Requested Changes (JSON)</label>
        <textarea value={requestedChanges} onChange={(e) => setRequestedChanges(e.target.value)} rows={7} />
        <div className="text-muted" style={{ marginTop: 6 }}>
          Example: {"{ \"mobilePhone\": \"+20...\", \"address\": { \"city\": \"Cairo\" } }"}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <Button disabled={loading} type="submit">
        {loading ? "Submitting..." : "Submit Change Request"}
      </Button>
    </form>
  );
}
