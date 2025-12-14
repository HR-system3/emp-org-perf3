// ./src/components/avatar.tsx

"use client";

type Props = {
  name: string;      // e.g. "Omar Elashry"
  size?: number;     // optional, default 32
};

export default function Avatar({ name, size = 32 }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background:
          "radial-gradient(circle at 30% 20%, #38bdf8, #1d4ed8, #020617)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        color: "#e5f0ff",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}