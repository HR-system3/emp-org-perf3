//.src/components/auth/LoginForm.tsx 

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { authService } from '@/services/api/auth.service';
import Card from '../common/Card';
import {api} from "@/lib/axios";


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
      const response = await authService.login({ email, password });
      console.log("Login response:", response);
  
      if (response?.access_token) {
        authService.setToken(response.access_token);
        window.location.href = "/dashboard";
        return;
      }
  
      setError("Login failed: No token received from server");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
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

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </Card>
  );
}