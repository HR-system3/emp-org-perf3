// ./src/app/(auth)/login/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  return <LoginForm redirectTo={next} />;
}
