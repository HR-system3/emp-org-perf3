// ./src/app/employee-profile/search-by-number/page.tsx

"use client";

import { useState } from "react";
import {api} from "@/lib/axios";
import { EmployeeProfile } from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SearchByEmployeeNumberPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [result, setResult] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!employeeNumber.trim()) {
      setError("Please enter an employee number.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get<EmployeeProfile>(
        `/employee-profile/employee-number/${employeeNumber.trim()}`
      );

      if (!res.data) {
        setError("No employee found with this employee number.");
        return;
      }

      setResult(res.data);
    } catch (err: any) {
      console.error("Search error:", err);
      const backendMessage =
        err?.response?.data?.message || err?.response?.data || err.message;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowRoles={["HR", "Admin"]}>
    <main className="page">
      <section
        className="card"
        style={{ maxWidth: 800, margin: "0 auto" }}
      >
        <BackButton />

        <h1>Search Employee by Employee Number</h1>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "0.8rem",
            marginTop: "1rem",
            alignItems: "center",
          }}
        >
          <input
            placeholder="e.g. EMP-0012"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "1rem", whiteSpace: "pre-wrap" }}>
            Error: {error}
          </p>
        )}

        {result && (
          <section style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 10,
              }}
            >
              <Avatar
                name={`${result.firstName} ${result.lastName}`}
                size={40}
              />
              <div>
                <h2 style={{ margin: 0 }}>
                  {result.firstName} {result.lastName}
                </h2>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {result.employeeNumber}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <StatusBadge kind="employee" value={result.status} />
              </div>
            </div>

            {/* details / JSON preview */}
            <pre
              style={{
                background: "#020617",
                color: "#e5e7eb",
                padding: "1rem",
                borderRadius: 12,
                marginTop: "0.75rem",
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </section>
    </main>
    </ProtectedRoute>
  );
}