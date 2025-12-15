// ./src/app/(dashboard)/departments/page.tsx

"use client";
import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DepartmentsPage() {
  return (
    <ProtectedRoute>
    <Card title="Departments" subtitle="Placeholder — Organization Structure module is not being edited in this milestone.">
      <div className="text-muted">This page is intentionally a placeholder to avoid modifying Org Structure.</div>
    </Card>
    </ProtectedRoute>
  );
}
