//.src/components/auth/ProtectedRoute.tsx 

"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";

type Props = {
  children: React.ReactNode;
  allowRoles?: Array<"Employee" | "Manager" | "HR" | "Admin">;
};

export default function ProtectedRoute({ children, allowRoles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const auth = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("hr_auth");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Client-only check
    const raw = localStorage.getItem("hr_auth");
    if (!raw) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (allowRoles && !allowRoles.includes(parsed.role)) {
        router.replace("/dashboard");
        return;
      }
      setReady(true);
    } catch {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [allowRoles, pathname, router]);

  if (!ready) return <Loading label="Checking session..." />;
  return <>{children}</>;
}
