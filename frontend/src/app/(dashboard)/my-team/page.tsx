"use client";

import Card from "@/components/common/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ManagerTeamDemoPage from "@/app/employee-profile/manager-team-demo/page";

export default function MyTeamPage() {
  return (
    <ProtectedRoute allowRoles={["Manager"]}>
      <Card
        title="My Team (Manager Insight)"
        subtitle="Phase II: Managers can view a non-sensitive summary of direct reports."
      >
        <ManagerTeamDemoPage />
      </Card>
    </ProtectedRoute>
  );
}