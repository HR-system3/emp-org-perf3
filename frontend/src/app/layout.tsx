// ./src/app/layout.tsx


// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HR System – Employee Profile",
  description: "Employee Profile subsystem – GIU Software Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <div className="top-nav-left">
              <div className="top-nav-logo">HR</div>
              <div>
                <div className="top-nav-title">HR System</div>
                <div className="top-nav-sub">Employee Profile Subsystem</div>
              </div>
            </div>

            <nav className="top-nav-links">
              <Link
                href="/employee-profile"
                className="top-nav-link top-nav-link-active"
              >
                Employee Profile
              </Link>
              <Link
                href="/employee-profile/employees"
                className="top-nav-link"
              >
                Directory
              </Link>
              <Link
                href="/employee-profile/change-requests"
                className="top-nav-link"
              >
                Change Requests
              </Link>
              <Link
                href="/employee-profile/self-demo"
                className="top-nav-link"
              >
                Self-Service
              </Link>
            </nav>

            <div className="top-nav-right">
              <span>Logged in as HR (demo)</span>
              <div className="nav-avatar">OH</div>
            </div>
          </header>

          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
