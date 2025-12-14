//.src/components/common/Card.tsx

"use client";

export default function Card({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page">
      <div className="page-inner">
        <div className="card">
          {title && <div className="card-title">{title}</div>}
          {subtitle && <div className="text-muted card-subtitle">{subtitle}</div>}
          <div style={{ marginTop: 14 }}>{children}</div>
        </div>
      </div>
    </main>
  );
}
