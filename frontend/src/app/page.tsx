"use client";

import Link from "next/link";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "860px",
  width: "100%",
  background:
    "radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 55%), rgba(3,7,18,0.98)",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.35)",
  padding: "2.5rem 2.25rem",
  boxShadow: "0 25px 50px rgba(15,23,42,0.9)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.9rem",
  fontWeight: 700,
  color: "#e5f2ff",
  marginBottom: "0.4rem",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#cbd5f5",
  maxWidth: "640px",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "1.8rem 0 0",
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
};

const itemTitleStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#3b82f6", // link blue
  textDecoration: "none",
};

const bulletStyle: React.CSSProperties = {
  fontSize: "0.9rem",
};

const itemDescStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#9ca3af",
  marginLeft: "1.45rem",
  marginTop: "0.15rem",
};

const footerStyle: React.CSSProperties = {
  marginTop: "1.8rem",
  fontSize: "0.78rem",
  color: "#9ca3af",
  maxWidth: "640px",
};

export default function EmployeeProfileHomePage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Employee Profile – Frontend Sandbox</h1>
        <p style={subtitleStyle}>
          Choose one of the flows below to demo the Employee Profile subsystem.
          HR users create and maintain profiles, while employees and managers
          use self-service screens.
        </p>

        <ul style={listStyle}>
          <li>
            <Link href="/employee-profile/new" style={itemTitleStyle}>
              <span style={bulletStyle}>➤</span>
              <span>Create Employee Profile (HR)</span>
            </Link>
            <p style={itemDescStyle}>
              HR creates a new employee master record with personal, contract,
              and organizational information.
            </p>
          </li>

          <li>
            <Link
              href="/employee-profile/search-by-number"
              style={itemTitleStyle}
            >
              <span style={bulletStyle}>➤</span>
              <span>Search Employee by Employee Number (HR)</span>
            </Link>
            <p style={itemDescStyle}>
              Quickly look up an existing employee using their employee number
              (e.g. EMP-0012) to view profile details.
            </p>
          </li>

          <li>
            <Link href="/employee-profile/self-demo" style={itemTitleStyle}>
              <span style={bulletStyle}>➤</span>
              <span>Self-Service Profile (Employee demo)</span>
            </Link>
            <p style={itemDescStyle}>
              Simulates an employee viewing and editing their own profile by
              loading a profile using its MongoDB ID.
            </p>
          </li>

          <li>
            <Link
              href="/employee-profile/change-requests"
              style={itemTitleStyle}
            >
              <span style={bulletStyle}>➤</span>
              <span>List Change Requests (HR)</span>
            </Link>
            <p style={itemDescStyle}>
              Shows all submitted profile change requests filtered by status
              (PENDING, APPROVED, REJECTED, etc.).
            </p>
          </li>

          <li>
            <Link
              href="/employee-profile/change-requests/process-demo"
              style={itemTitleStyle}
            >
              <span style={bulletStyle}>➤</span>
              <span>Process Change Request (HR demo)</span>
            </Link>
            <p style={itemDescStyle}>
              HR pastes a Request ID (ECR-...) and updates its status, optionally
              applying approved changes to the profile.
            </p>
          </li>

          <li>
            <Link
              href="/employee-profile/manager-team-demo"
              style={itemTitleStyle}
            >
              <span style={bulletStyle}>➤</span>
              <span>Manager Team View (demo)</span>
            </Link>
            <p style={itemDescStyle}>
              Paste a manager&apos;s EmployeeProfile MongoDB ID to load their
              direct reports and basic team information.
            </p>
          </li>
        </ul>

        <p style={footerStyle}>
          For now, some demo screens ask you to paste MongoDB IDs manually. In a
          real integrated system these values would come from the logged-in user
          and from the Organization Structure subsystem.
        </p>
      </section>
    </main>
  );
}