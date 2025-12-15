// ./src/app/(dashboard)/positions/page.tsx 

"use client";
import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PositionsPage() {
  return (
    <ProtectedRoute>
    <Card title="Positions" subtitle="Placeholder — Organization Structure module is not being edited in this milestone.">
      <div className="text-muted">This page is intentionally a placeholder.</div>
    </Card>
    </ProtectedRoute>
  );
}

