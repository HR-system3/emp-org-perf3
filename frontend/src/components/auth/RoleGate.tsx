// ./src/components/auth/RoleGate.tsx

"use client";

import React from "react";
import useAuth from "@/hooks/useAuth";

type Props = {
  allowRoles?: Array<"Employee" | "Manager" | "HR" | "Admin">;
  children: React.ReactNode;
  fallback?: React.ReactNode; // optional: render something else instead
};

export default function RoleGate({ allowRoles, children, fallback = null }: Props) {
  const { auth } = useAuth();

  // If not logged in, hide (ProtectedRoute will handle redirect on protected pages)
  if (!auth) return fallback;

  // If no role restrictions, show for any logged-in user
  if (!allowRoles || allowRoles.length === 0) return <>{children}</>;

  return allowRoles.includes(auth.role) ? <>{children}</> : fallback;
}