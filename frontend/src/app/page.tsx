// ./src/app/page.tsx

"use client";

import Link from "next/link";

export default function HrSystemHomePage() {
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
        {/* HEADER */}
        <header style={{ marginBottom: "1.8rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            HR System – Subsystems Overview
          </h1>
          <p className="text-muted" style={{ maxWidth: "680px" }}>
            This dashboard lets you jump into each HR subsystem. Each subsystem
            has its own frontend sandbox and APIs. For now, only{" "}
            <strong>Employee Profile</strong> is implemented in the frontend.
          </p>
        </header>

        {/* GRID OF SUBSYSTEM CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.3rem",
          }}
        >
          {/* EMPLOYEE PROFILE – ACTIVE CARD */}
          <Link
            href="/employee-profile"
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(96, 165, 250, 0.5)",
              background: "rgba(15,23,42,0.95)",
              padding: "1.2rem 1.3rem",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#93c5fd",
              }}
            >
              Subsystem
            </span>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Employee Profile
            </h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Master employee records, self-service profile updates, profile
              change requests, and manager team view.
            </p>
            <div
              style={{
                marginTop: "0.3rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "999px",
                  background:
                    "radial-gradient(circle at 30% 0%, #60a5fa, #1d4ed8)",
                  fontSize: "0.75rem",
                }}
              >
                →
              </span>
              Open Employee Profile sandbox
            </div>
          </Link>

          {/* PLACEHOLDER CARDS FOR OTHER SUBSYSTEMS */}
          {[
            "Organization Structure",
            "Recruitment",
            "Time & Attendance",
            "Leaves Management",
            "Payroll",
            "Performance Management",
          ].map((name) => (
            <div
              key={name}
              style={{
                borderRadius: "18px",
                border: "1px dashed rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.4)",
                padding: "1.2rem 1.3rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.45rem",
                opacity: 0.8,
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9ca3af",
                }}
              >
                Subsystem (frontend not implemented)
              </span>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  margin: 0,
                  color: "#e5e7eb",
                }}
              >
                {name}
              </h2>
              <p className="text-muted" style={{ fontSize: "0.88rem" }}>
                Backend APIs exist in the main HR system. A dedicated frontend
                sandbox can be added later, similar to Employee Profile.
              </p>
              <span
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                }}
              >
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}