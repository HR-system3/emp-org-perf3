"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // example usage (keep whatever you already do)
  const next = searchParams.get("next") || "/";

  return (
    <div>
      {/* your login UI here */}
      {/* when login succeeds: */}
      {/* router.push(next); */}
      Login page
    </div>
  );
}