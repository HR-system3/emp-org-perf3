"use client";

import Link from "next/link";

export default function BackButton() {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <Link
        href="/"
        style={{
          color: "#0070f3",
          textDecoration: "none",
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.35rem 0.7rem",
          borderRadius: "999px",
          border: "1px solid #0070f3",
          fontSize: "0.9rem",
        }}
      >
        <span>←</span>
        <span>Back to Employee Profile Page</span>
      </Link>
    </div>
  );
}
