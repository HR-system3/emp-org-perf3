// ./src/components/BackToMain.tsx

"use client";

import Link from "next/link";

export default function BackToMainButton() {
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: "0.9rem",
        fontWeight: 600,
        textDecoration: "none",
        padding: "0.35rem 0.9rem",
        borderRadius: "999px",
        // same blue pill style as your other buttons
        background:
          "linear-gradient(135deg, #3b82f6, #22c1c3)",
        color: "white",
        boxShadow: "0 10px 25px rgba(37, 99, 235, 0.45)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      ← Back to HR System Dashboard
    </Link>
  );
}

