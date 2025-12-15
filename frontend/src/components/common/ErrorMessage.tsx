//.src/components/common/ErrorMessage.tsx

"use client";

// ErrorMessage.tsx
export default function ErrorMessage({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="error-box">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss}>×</button>}
    </div>
  );
}
