"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { EmployeeProfile } from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";


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

      // If backend returns null (no employee found)
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
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
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
          <h2>Employee Details</h2>
          <p>
            <strong>Name:</strong> {result.firstName} {result.lastName}
          </p>
          <p>
            <strong>Employee Number:</strong> {result.employeeNumber}
          </p>
          <p>
            <strong>Status:</strong> {result.status}</p>
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
