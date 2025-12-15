// ./src/app/(auth)/login/LoginClient.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";

type LoginResponse = {
  userId: string;
  role: "Employee" | "Manager" | "HR" | "Admin";
  token?: string; // if you return it
};

export default function LoginClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const next = useMemo(() => sp.get("next") || "/dashboard", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // change endpoint/body to match YOUR backend
      const res = await api.post<LoginResponse>("/auth/login", { email, password });

      // store auth for ProtectedRoute/RoleGate
      localStorage.setItem(
        "hr_auth",
        JSON.stringify({
          userId: res.data.userId,
          role: res.data.role,
        })
      );

      router.replace(next);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Login failed";
      setErr(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="page"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <section className="card" style={{ width: "min(520px, 92vw)" }}>
        <h1 style={{ marginTop: 0 }}>Login</h1>
        <p className="text-muted">Sign in to access the dashboard.</p>

        {err && <p className="error">Error: {err}</p>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}