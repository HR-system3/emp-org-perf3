// ./src/app/employee-profile/manager-team-demo/page.tsx

"use client";

import { useState } from "react";
import {api} from "@/lib/axios";
import { EmployeeProfile } from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  <ProtectedRoute allowRoles={["Manager"]}>
    <main className="page">
      <section
        className="card"
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <BackButton />

        <h1>Manager Team View (Demo)</h1>
        <p>Paste Manager&apos;s EmployeeProfile Mongo _id.</p>

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
                <th style={{ borderBottom: "1px solid #333", textAlign: "left" }}>
                  Name
                </th>
                <th style={{ borderBottom: "1px solid #333", textAlign: "left" }}>
                  Employee #
                </th>
                <th style={{ borderBottom: "1px solid #333", textAlign: "left" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {team.map((emp) => (
                <tr key={emp._id}>
                  <td style={{ padding: "0.45rem 0.2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar
                        name={`${emp.firstName} ${emp.lastName}`}
                        size={26}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {emp.employeeNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.45rem 0.2rem", fontSize: 13 }}>
                    {emp.employeeNumber}
                  </td>
                  <td style={{ padding: "0.45rem 0.2rem" }}>
                    <StatusBadge kind="employee" value={emp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && team.length === 0 && (
          <p style={{ marginTop: "1rem" }}>No team members found.</p>
        )}
      </section>
    </main>
    </ProtectedRoute>
  );
}