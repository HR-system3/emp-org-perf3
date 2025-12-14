// ./src/components/BackButton.tsx

"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/employee-profile")}
      style={{
        background: "transparent",
        border: "none",
        color: "#5DAFFF",          // <── bright blue, very visible
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        marginBottom: "1rem",
        padding: 0,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = "#8CC8FF") // lighter on hover
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "#5DAFFF")
      }
    >
      ← Back to Employee Profile Page
    </button>
  );
}
