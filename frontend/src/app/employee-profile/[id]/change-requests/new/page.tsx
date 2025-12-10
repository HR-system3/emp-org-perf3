"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";
import {
  ChangeRequestCategory,
  EmployeeProfileChangeRequest,
} from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";


const categories: ChangeRequestCategory[] = [
  "PERSONAL_INFORMATION",
  "JOB_INFORMATION",
  "ORGANIZATIONAL_ASSIGNMENT",
  "COMPENSATION_AND_BENEFITS",
  "OTHER",
];

export default function NewChangeRequestPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [category, setCategory] = useState<ChangeRequestCategory>(
    "PERSONAL_INFORMATION"
  );
  const [reason, setReason] = useState("");
  const [requestedChanges, setRequestedChanges] = useState(
    '{\n  "fieldName": "newValue"\n}'
  );
  const [result, setResult] = useState<EmployeeProfileChangeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsed: Record<string, any> = {};
      if (requestedChanges.trim()) {
        parsed = JSON.parse(requestedChanges);
      }

      const payload = {
        category,
        reason: reason || undefined,
        requestedChanges: parsed,
      };

      const res = await api.post<EmployeeProfileChangeRequest>(
        `/employee-profile/${employeeId}/change-requests`,
        payload
      );
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError("Invalid JSON in requestedChanges");
      } else {
        setError(err.response?.data?.message || "Failed to create request");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!employeeId) {
    return <p>Missing employee id in URL.</p>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <BackButton />
      <h1>New Profile Change Request</h1>
      <p>EmployeeProfileId: {employeeId}</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }}
      >
        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ChangeRequestCategory)
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Reason (free text)</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div>
          <label>Requested Changes (JSON)</label>
          <textarea
            rows={6}
            value={requestedChanges}
            onChange={(e) => setRequestedChanges(e.target.value)}
          />
          <small>
            Example: {"{ \"primaryDepartmentId\": \"...\", \"status\": \"ACTIVE\" }"}
          </small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Change Request"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          Error: {Array.isArray(error) ? error.join(", ") : error}
        </p>
      )}

      {result && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Created Request</h2>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: "1rem",
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
