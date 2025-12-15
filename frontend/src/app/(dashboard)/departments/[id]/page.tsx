// ./src/app/(dashboard)/departments/[id]/page.tsx 

"use client";
import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DepartmentDetailsPage() {
  return (
    <ProtectedRoute>
    <Card title="Department Details" subtitle="Placeholder — Organization Structure module is not being edited in this milestone.">
      <div className="text-muted">Not implemented.</div>
    </Card>
    </ProtectedRoute>
  );
}
