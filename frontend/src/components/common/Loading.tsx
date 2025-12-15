// src/components/common/Loading.tsx
import React from "react";

type LoadingProps = {
  // support both styles:
  label?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
};

export default function Loading({ label, text, size = "md" }: LoadingProps) {
  const message = text ?? label ?? "Loading...";

  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-3">
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 ${
            size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"
          }`}
        />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}