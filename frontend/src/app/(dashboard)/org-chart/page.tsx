// ./src/app/(dashboard)/org-chart/page.tsx 

"use client";
import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function OrgChartPage() {
  return (
    <ProtectedRoute>
    <Card title="Org Chart" subtitle="Placeholder — Organization Structure module is not being edited in this milestone.">
      <div className="text-muted">Not implemented.</div>
    </Card>
    </ProtectedRoute>
  );
}
