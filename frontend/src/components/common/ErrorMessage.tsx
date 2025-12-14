//.src/components/common/ErrorMessage.tsx

"use client";

export default function ErrorMessage({ message }: { message: string }) {
  return <div className="error">Error: {message}</div>;
}
