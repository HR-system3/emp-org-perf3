//.src/components/common/Loading.tsx 

"use client";

export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <main className="page">
      <div className="page-inner">
        <div className="card">
          <div className="skeleton" style={{ width: 220, height: 20, marginBottom: 10 }} />
          <div className="text-muted">{label}</div>
        </div>
      </div>
    </main>
  );
}
