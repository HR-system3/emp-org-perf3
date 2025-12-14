// ./src/app/page.tsx

"use client";

import Link from "next/link";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  width: "100%",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "3rem",
  color: "white",
};

const mainTitleStyle: React.CSSProperties = {
  fontSize: "3rem",
  fontWeight: 700,
  marginBottom: "0.5rem",
};

const mainSubtitleStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  opacity: 0.9,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
  gap: "2rem",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(3,7,18,0.95)",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.35)",
  padding: "2rem",
  boxShadow: "0 25px 50px rgba(15,23,42,0.9)",
};

const cardHeaderStyle: React.CSSProperties = {
  marginBottom: "1.5rem",
  textAlign: "center",
};

const moduleIconStyle: React.CSSProperties = {
  fontSize: "3.5rem",
  marginBottom: "0.5rem",
};

const moduleTitleStyle: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 700,
  marginBottom: "0.5rem",
};

const orgTitleColor: React.CSSProperties = {
  ...moduleTitleStyle,
  color: "#3b82f6",
};

const empTitleColor: React.CSSProperties = {
  ...moduleTitleStyle,
  color: "#10b981",
};

const moduleDescStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#cbd5e1",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  background: "rgba(59,130,246,0.1)",
  borderRadius: "8px",
  color: "#3b82f6",
  textDecoration: "none",
  fontSize: "0.9rem",
  fontWeight: 600,
  transition: "all 0.2s",
};

const empLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: "rgba(16,185,129,0.1)",
  color: "#10b981",
};

const iconStyle: React.CSSProperties = {
  fontSize: "1.2rem",
};

const descStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#9ca3af",
  marginLeft: "2rem",
  marginTop: "0.25rem",
};

export default function HomePage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <h1 style={mainTitleStyle}>🏢 HR Management System</h1>
          <p style={mainSubtitleStyle}>
            Complete Employee Profile & Organization Structure Management
          </p>
        </header>

        <div style={gridStyle}>
          {/* Organization Structure Module */}
          <section style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={moduleIconStyle}>🏗️</div>
              <h2 style={orgTitleColor}>Organization Structure</h2>
              <p style={moduleDescStyle}>
                Manage departments, positions, hierarchy, and organizational changes
              </p>
            </div>

            <ul style={listStyle}>
              <li>
                <Link 
                  href="/dashboard" 
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                >
                  <span style={iconStyle}>📊</span>
                  <span>Dashboard Overview</span>
                </Link>
                <p style={descStyle}>View stats and quick access to all features</p>
              </li>

              <li>
                <Link 
                  href="/departments" 
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                >
                  <span style={iconStyle}>🏢</span>
                  <span>Departments</span>
                </Link>
                <p style={descStyle}>Create, view, and manage departments</p>
              </li>

              <li>
                <Link 
                  href="/positions" 
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                >
                  <span style={iconStyle}>💼</span>
                  <span>Positions</span>
                </Link>
                <p style={descStyle}>Manage positions, activate/deactivate</p>
              </li>

              <li>
                <Link 
                  href="/change-requests" 
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                >
                  <span style={iconStyle}>📝</span>
                  <span>Change Requests</span>
                </Link>
                <p style={descStyle}>Submit and approve organizational changes</p>
              </li>

              <li>
                <Link 
                  href="/org-chart" 
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                >
                  <span style={iconStyle}>🌳</span>
                  <span>Org Chart Visualization</span>
                </Link>
                <p style={descStyle}>View organizational hierarchy tree</p>
              </li>
            </ul>
          </section>

          {/* Employee Profile Module */}
          <section style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={moduleIconStyle}>👥</div>
              <h2 style={empTitleColor}>Employee Profile</h2>
              <p style={moduleDescStyle}>
                Create, search, and maintain employee master records
              </p>
            </div>

            <ul style={listStyle}>
              <li>
                <Link 
                  href="/employee-profile/new" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>➕</span>
                  <span>Create Employee Profile (HR)</span>
                </Link>
                <p style={descStyle}>Create new employee master record with all details</p>
              </li>

              <li>
                <Link 
                  href="/employee-profile/search-by-number" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>🔍</span>
                  <span>Search Employee by Number</span>
                </Link>
                <p style={descStyle}>Look up employees using employee number (EMP-0012)</p>
              </li>

              <li>
                <Link 
                  href="/employee-profile/self-demo" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>👨‍💼</span>
                  <span>Self-Service Profile (Demo)</span>
                </Link>
                <p style={descStyle}>Employee views and edits their own profile</p>
              </li>

              <li>
                <Link 
                  href="/employee-profile/change-requests" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>📋</span>
                  <span>List Change Requests (HR)</span>
                </Link>
                <p style={descStyle}>View all profile change requests by status</p>
              </li>

              <li>
                <Link 
                  href="/employee-profile/change-requests/process" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>✅</span>
                  <span>Process Change Requests</span>
                </Link>
                <p style={descStyle}>HR reviews and approves/rejects profile changes</p>
              </li>

              <li>
                <Link 
                  href="/employee-profile/manager-team-demo" 
                  style={empLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <span style={iconStyle}>👥</span>
                  <span>Manager Team View (Demo)</span>
                </Link>
                <p style={descStyle}>Manager views direct reports and team info</p>
              </li>
            </ul>
          </section>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "rgba(255,255,255,0.1)",
              border: "2px solid white",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "white";
            }}
          >
            🔐 Login to System
          </Link>
        </div>
      </div>
    </main>
  );
}