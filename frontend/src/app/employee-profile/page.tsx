// ./src/app/employee-profile/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  EmployeeProfile,
  EmployeeProfileChangeRequest,
} from "@/types/employeeProfile";
import BackToMainButton from "@/components/BackToMainButton";

type EmployeesOverview = {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
};

type ChangeRequestsOverview = {
  pending: number;
  approved: number;
  rejected: number;
};

export default function EmployeeProfileHomePage() {
  const [employeesOverview, setEmployeesOverview] =
    useState<EmployeesOverview | null>(null);
  const [changeOverview, setChangeOverview] =
    useState<ChangeRequestsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setError(null);

    try {
      // ----- Employees -----
      const employeesRes = await api.get<EmployeeProfile[]>("/employee-profile");
      const employees = employeesRes.data;

      const empSummary: EmployeesOverview = {
        total: employees.length,
        active: employees.filter((e) => e.status === "ACTIVE").length,
        onLeave: employees.filter((e) => e.status === "ON_LEAVE").length,
        terminated: employees.filter((e) => e.status === "TERMINATED").length,
      };
      setEmployeesOverview(empSummary);

      // ----- Change requests -----
      const crRes = await api.get<EmployeeProfileChangeRequest[]>(
        "/employee-profile/change-requests"
      );
      const cr = crRes.data;

      const crSummary: ChangeRequestsOverview = {
        pending: cr.filter((c) => c.status === "PENDING").length,
        approved: cr.filter((c) => c.status === "APPROVED").length,
        rejected: cr.filter((c) => c.status === "REJECTED").length,
      };
      setChangeOverview(crSummary);
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to load overview data.";
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
    void loadOverview();
  }, []);

  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Main dark card */}
      <section
        className="card"
        style={{
          width: "min(1100px, 100%)",
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 55%) #050816",
          borderRadius: "24px",
          padding: "2.4rem 2.8rem",
          boxShadow: "0 32px 60px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: "1.5rem" }}>
          <BackToMainButton />
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            Employee Profile – Frontend Sandbox
          </h1>
          <p className="text-muted" style={{ maxWidth: "620px" }}>
            Choose one of the flows below to demo the Employee Profile
            subsystem. HR users create and maintain profiles, while employees
            and managers use self-service and insight screens.
          </p>
          {error && (
            <p
              style={{
                marginTop: "0.75rem",
                color: "#f97373",
                fontSize: "0.9rem",
              }}
            >
              Error loading overview: {error}
            </p>
          )}
        </header>

        {/* 2-column layout inside the card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
            gap: "1.5rem",
          }}
        >
          {/* LEFT: list of flows */}
          <div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/new"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Create Employee Profile (HR)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Onboard a new employee with personal, contract, and
                  organizational info.
                </p>
              </li>

              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/search-by-number"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Search Employee by Employee Number (HR)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Quickly look up an existing employee using their employee
                  number (e.g., EMP-0012).
                </p>
              </li>

              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/self-demo"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Self-Service Profile (Employee demo)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Simulates an employee viewing and editing their own profile via
                  a self-service screen.
                </p>
              </li>

              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/change-requests"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ List Change Requests (HR)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Review all submitted profile change requests and filter by
                  status (Pending, Approved, Rejected, Canceled).
                </p>
              </li>

             

              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/change-requests/process"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Process Change Request (HR demo)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Process a specific change request by Request ID, update its
                  status and optionally apply the changes to the employee
                  profile.
                </p>
              </li>

              <li>
                <Link
                  href="/employee-profile/manager-team-demo"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Manager Team View (demo)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Paste a manager&apos;s EmployeeProfile Mongo <code>_id</code>{" "}
                  to load their direct reports and basic team information.
                </p>
              </li>

              <li style={{ marginBottom: "0.9rem" }}>
                <Link
                  href="/employee-profile/employees"
                  style={{ fontWeight: 600, color: "#60a5fa" }}
                >
                  ➤ Employees Directory (HR)
                </Link>
                <p className="text-muted" style={{ marginTop: "0.25rem" }}>
                  Browse all employees in the system, filter by name/number/
                  status, and open any profile.
                </p>
              </li>
            </ul>
          </div>

          {/* RIGHT: three small cards stacked */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
            }}
          >
            {/* Employees overview card */}
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(15,23,42,0.9)",
                padding: "1rem 1.1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.45rem",
                }}
              >
                <span
                  style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e5e7eb" }}
                >
                  Employees overview
                </span>
                <button
                  type="button"
                  onClick={loadOverview}
                  disabled={loading}
                  style={{
                    borderRadius: "999px",
                    border: "none",
                    padding: "0.28rem 0.8rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #3b82f6, #22c1c3)",
                    color: "white",
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <p
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "0.2rem",
                }}
              >
                {employeesOverview ? employeesOverview.total : "–"} employees
              </p>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}
              >
                {employeesOverview ? employeesOverview.active : "–"} active ·{" "}
                {employeesOverview ? employeesOverview.onLeave : "–"} on leave ·{" "}
                {employeesOverview ? employeesOverview.terminated : "–"} terminated
              </p>

              <Link
                href="/employee-profile/employees"
                style={{
                  fontSize: "0.82rem",
                  color: "#93c5fd",
                  textDecoration: "underline",
                }}
              >
                Open employees directory
              </Link>
            </div>

            {/* Change requests overview card */}
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(15,23,42,0.9)",
                padding: "1rem 1.1rem",
              }}
            >
              <span
                style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e5e7eb" }}
              >
                Change requests
              </span>

              <p
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  margin: "0.4rem 0 0.2rem",
                }}
              >
                {changeOverview ? changeOverview.pending : "–"} pending
              </p>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}
              >
                {changeOverview ? changeOverview.approved : "–"} approved ·{" "}
                {changeOverview ? changeOverview.rejected : "–"} rejected
              </p>

              <Link
                href="/employee-profile/change-requests"
                style={{
                  fontSize: "0.82rem",
                  color: "#93c5fd",
                  textDecoration: "underline",
                }}
              >
                Open change requests
              </Link>
            </div>

            {/* Demo notes card */}
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(15,23,42,0.8)",
                padding: "1rem 1.1rem",
              }}
            >
              <span
                style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e5e7eb" }}
              >
                Demo notes
              </span>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", marginTop: "0.45rem" }}
              >
                For now, some demo screens still ask you to paste MongoDB IDs
                manually. In a real integrated system these values would come
                from authentication and from the Organization Structure
                subsystem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}