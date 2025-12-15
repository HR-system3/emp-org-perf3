// ./src/app/(dashboard)/positions/[id]/page.tsx 

"use client";
import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PositionDetailsPage() {
  return (
    <ProtectedRoute>
    <Card title="Position Details" subtitle="Placeholder — Organization Structure module is not being edited in this milestone.">
      <div className="text-muted">Not implemented.</div>
    </Card>
    </ProtectedRoute>
  );
}
