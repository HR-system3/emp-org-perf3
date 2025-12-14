//.src/components/auth/LoginForm.tsx 

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import ErrorMessage from "@/components/common/ErrorMessage";

type Props = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"Employee" | "Manager" | "HR" | "Admin">("HR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin() {
    // Demo login (no backend dependency)
    localStorage.setItem(
      "hr_auth",
      JSON.stringify({
        role,
        userId: userId || "", // optional
        email,
        loggedInAt: new Date().toISOString(),
      })
    );
    router.push(redirectTo);
  }

  async function handleBackendLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      /**
       * If your backend supports real login, this will work.
       * If not, user can use Demo Login.
       *
       * Expected backend response examples:
       * - { userId, role }
       * - { user: { _id }, role }
       */
      const res = await api.post("/auth/login", { email, password });

      const data = res.data || {};
      const resolvedUserId =
        data.userId || data?.user?._id || data?.user?.id || userId || "";
      const resolvedRole =
        data.role || data?.user?.role || role || "Employee";

      localStorage.setItem(
        "hr_auth",
        JSON.stringify({
          role: resolvedRole,
          userId: resolvedUserId,
          email,
          loggedInAt: new Date().toISOString(),
        })
      );

      router.push(redirectTo);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Login failed. Use Demo Login if backend auth is not ready.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Login" subtitle="Use backend login if available, or Demo Login for Milestone 3.">
      <form onSubmit={handleBackendLogin} className="form-grid" style={{ marginTop: 10 }}>
        <div className="form-row">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="omar@example.com" />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
        </div>

        <div className="form-row">
          <label>Role (demo)</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>
          <div className="text-muted" style={{ marginTop: 6 }}>
            Employee = self-service only • Manager = team view • HR/Admin = directory + approve requests
          </div>
        </div>

        <div className="form-row">
          <label>UserId (optional, for Employee/Manager endpoints)</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Paste EmployeeProfile _id (optional)"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in (Backend)"}
          </Button>
          <Button type="button" variant="ghost" onClick={handleDemoLogin} disabled={loading}>
            Continue (Demo)
          </Button>
        </div>
      </form>
    </Card>
  );
}
