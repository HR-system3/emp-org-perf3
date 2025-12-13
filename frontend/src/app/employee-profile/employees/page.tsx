// src/app/employee-profile/employees/page.tsx

"use client";

import { useState, useEffect } from "react";
import {api} from "@/lib/axios";
import { EmployeeProfile } from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Avatar from "@/components/Avatar";

export default function EmployeesDirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EmployeeProfile[]>("/employee-profile", {
        params: { search: search || undefined },
      });
      setEmployees(res.data);
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to load employees.";
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
    // load employees automatically when the page opens
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = employees.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.employeeNumber.toLowerCase().includes(q) ||
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      (e.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="page">
      <section className="card">
        <BackButton />

        <h1>Employees Directory (HR)</h1>
        <p className="text-muted">
          Browse all employee profiles stored in the system. Use the search box
          to filter by name, employee number, or status, then click any row to
          open the full profile.
        </p>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <input
            placeholder="Search by name, employee number, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={loadEmployees} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && <p className="error">Error: {error}</p>}

        <div className="table-wrapper" style={{ marginTop: "1rem" }}>
          {loading && !employees.length ? (
            <div style={{ padding: "1rem" }}>Loading employees…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "1rem" }}>No employees found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Date of Hire</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp._id}>
                    {/* Employee cell with avatar + name + number */}
                    <td>
                      <Link
                        href={`/employee-profile/${emp._id}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Avatar
                            name={`${emp.firstName} ${emp.lastName}`}
                            size={28}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                              }}
                            >
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 11 }}
                            >
                              {emp.employeeNumber}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Status with StatusBadge */}
                    <td>
                      <StatusBadge kind="employee" value={emp.status} />
                    </td>

                    {/* Date of hire */}
                    <td>
                      {emp.dateOfHire
                        ? new Date(emp.dateOfHire).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}