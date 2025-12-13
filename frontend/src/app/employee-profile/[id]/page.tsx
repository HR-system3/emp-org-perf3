"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {api} from "@/lib/axios";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { EmployeeProfile } from "@/types/employeeProfile";

export default function EmployeeProfileDetailsPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!employeeId) {
        setError("Missing employee id in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get<EmployeeProfile>(
          `/employee-profile/${employeeId}`
        );
        setEmployee(res.data);
      } catch (err: any) {
        console.error(err);
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to load employee profile.";
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : JSON.stringify(backendMessage)
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [employeeId]);

  if (loading) {
    return (
      <main className="page">
        <div className="page-inner">
          <div className="card">
            <BackButton />
            <div style={{ marginTop: 12 }}>
              <div
                className="skeleton"
                style={{ width: 160, height: 24, marginBottom: 12 }}
              />
              <div
                className="skeleton"
                style={{ width: 260, height: 16, marginBottom: 8 }}
              />
              <div
                className="skeleton"
                style={{ width: "100%", height: 130, borderRadius: 18 }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="page-inner">
          <div className="card">
            <BackButton />
            <h1 style={{ marginTop: 16, marginBottom: 8 }}>
              Employee Profile
            </h1>
            <p className="error">Error: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="page">
        <div className="page-inner">
          <div className="card">
            <BackButton />
            <h1 style={{ marginTop: 16, marginBottom: 8 }}>
              Employee Profile
            </h1>
            <p className="text-muted">Employee not found.</p>
          </div>
        </div>
      </main>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <main className="page">
      <div className="page-inner">
        <div className="card">
          <BackButton />

          {/* HEADER */}
          <header
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <Avatar name={fullName} size={52} />
            <div>
              <h1 style={{ margin: 0, fontSize: 24 }}>{fullName}</h1>
              <div
                className="text-muted"
                style={{ fontSize: 13, marginTop: 2 }}
              >
                Employee #{employee.employeeNumber || "—"}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <StatusBadge kind="employee" value={employee.status} />
            </div>
          </header>

          {/* MAIN CONTENT */}
          <section
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
              gap: 24,
            }}
          >
            {/* PERSONAL INFO */}
            <div
              style={{
                padding: 14,
                borderRadius: 18,
                border: "1px solid var(--border-subtle)",
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))",
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 8 }}>
                Personal information
              </h2>
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0, 1fr)",
                  rowGap: 6,
                  columnGap: 10,
                  fontSize: 13,
                }}
              >
                <Term label="First name" value={employee.firstName} />
                <Term label="Last name" value={employee.lastName} />
                <Term label="National ID" value={employee.nationalId} />
                <Term
                  label="Personal email"
                  value={employee.personalEmail}
                />
                <Term label="Mobile phone" value={employee.mobilePhone} />
                <Term label="Home phone" value={employee.homePhone} />
                <Term
                  label="Date of birth"
                  value={
                    employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : undefined
                  }
                />
                <Term
                  label="Biography"
                  value={employee.biography}
                  long
                />
                <Term
                  label="Address"
                  value={
                    employee.address
                      ? [
                          employee.address.streetAddress,
                          employee.address.city,
                          employee.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : undefined
                  }
                  long
                />
              </dl>
            </div>

            {/* EMPLOYMENT INFO */}
            <div
              style={{
                padding: 14,
                borderRadius: 18,
                border: "1px solid var(--border-subtle)",
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))",
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 8 }}>
                Employment details
              </h2>
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px minmax(0, 1fr)",
                  rowGap: 6,
                  columnGap: 10,
                  fontSize: 13,
                }}
              >
                <Term
                  label="Employee #"
                  value={employee.employeeNumber}
                />
                <Term
                  label="Status"
                  value={employee.status.replace(/_/g, " ")}
                />
                <Term
                  label="Contract"
                  value={
                    employee.contractType
                      ? employee.contractType.replace(/_/g, " ")
                      : undefined
                  }
                />
                <Term
                  label="Date of hire"
                  value={
                    employee.dateOfHire
                      ? new Date(employee.dateOfHire).toLocaleDateString()
                      : undefined
                  }
                />
                <Term
                  label="Department"
                  value={employee.primaryDepartmentId || "—"}
                />
                <Term
                  label="Position"
                  value={employee.primaryPositionId || "—"}
                />
                <Term
                  label="Pay grade"
                  value={
                    employee.payGradeId ? String(employee.payGradeId) : "—"
                  }
                />
              </dl>

              <div style={{ marginTop: 14 }}>
                <a
                  href={`/employee-profile/${employee._id}/change-requests/new`}
                  className="btn"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  Request profile change
                </a>
              </div>
            </div>
          </section>

          {/* RAW JSON */}
          <section style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>Raw document</h2>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
              This is the JSON document exactly as stored in MongoDB (useful
              for debugging and demo purposes).
            </p>
            <pre
              style={{
                background: "#020617",
                borderRadius: 16,
                padding: "12px 14px",
                maxHeight: 260,
                overflow: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(employee, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}

function Term({
  label,
  value,
  long,
}: {
  label: string;
  value?: string;
  long?: boolean;
}) {
  return (
    <>
      <dt
        style={{
          color: "var(--text-muted)",
          fontSize: 12,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13,
          whiteSpace: long ? "pre-wrap" : "nowrap",
          overflow: long ? "visible" : "hidden",
          textOverflow: long ? "clip" : "ellipsis",
        }}
      >
        {value || "—"}
      </dd>
    </>
  );
}