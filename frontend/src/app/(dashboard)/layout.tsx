// ./src/app/(dashboard)/layout.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useAuth from "@/hooks/useAuth";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link className={active ? "top-nav-link top-nav-link-active" : "top-nav-link"} href={href}>
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <header className="top-nav">
          <div className="top-nav-left">
            <div className="top-nav-logo">HR</div>
            <div>
              <div className="top-nav-title">HR System</div>
              <div className="top-nav-sub">Milestone 3 – Frontend</div>
            </div>
          </div>

          <nav className="top-nav-links">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/dashboard/profile" label="My Profile" />
            <NavLink href="/dashboard/my-team" label="My Team" />
            <NavLink href="/dashboard/change-requests" label="Change Requests" />
            {/* Org pages exist but placeholder only */}
            <NavLink href="/dashboard/org-chart" label="Org Chart" />
          </nav>

          <div className="top-nav-right">
            <span>
              Role: <strong>{user?.role || "—"}</strong>
            </span>
            <span className="text-muted">{user?.id ? `UserId: ${user.id}` : "No UserId"}</span>
            <button
              className="btn btn-ghost"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
