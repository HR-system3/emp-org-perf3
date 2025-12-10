"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { EmployeeProfile } from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";

export default function ManagerTeamDemoPage() {
  const [managerId, setManagerId] = useState("");
  const [team, setTeam] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!managerId) return;
    setLoading(true);
    setError(null);
    setTeam([]);

    try {
      const res = await api.get<EmployeeProfile[]>(
        `/employee-profile/manager/${managerId}/team`
      );
      setTeam(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <BackButton />
      <h1>Manager Team View (Demo)</h1>
      <p>Paste Manager's EmployeeProfile Mongo _id.</p>

      <form
        onSubmit={handleLoad}
        style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}
      >
        <input
          placeholder="Manager employeeProfile _id"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Load Team"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          Error: {Array.isArray(error) ? error.join(", ") : error}
        </p>
      )}

      {team.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                Name
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                Employee #
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((emp) => (
              <tr key={emp._id}>
                <td style={{ padding: "0.4rem 0.2rem" }}>
                  {emp.firstName} {emp.lastName}
                </td>
                <td style={{ padding: "0.4rem 0.2rem" }}>
                  {emp.employeeNumber}
                </td>
                <td style={{ padding: "0.4rem 0.2rem" }}>{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && team.length === 0 && (
        <p style={{ marginTop: "1rem" }}>No team members found.</p>
      )}
    </main>
  );
}
