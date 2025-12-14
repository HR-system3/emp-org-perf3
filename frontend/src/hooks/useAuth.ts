//.src/hooks/useAuth.ts  

"use client";

import { useEffect, useState } from "react";

export type Role = "Employee" | "Manager" | "HR" | "Admin";

export type AuthState = {
  role: Role;
  userId?: string;
  email?: string;
  loggedInAt?: string;
};

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hr_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  function logout() {
    localStorage.removeItem("hr_auth");
    setAuth(null);
  }

  return { auth, setAuth, logout };
}
