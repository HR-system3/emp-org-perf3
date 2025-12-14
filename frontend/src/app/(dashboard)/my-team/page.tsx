// ./src/app/(dashboard)/my-team/page.tsx

"use client";

import Card from "@/components/common/Card";
import ManagerTeamDemoPage from "@/app/employee-profile/manager-team-demo/page";

export default function MyTeamPage() {
  return (
    <Card
      title="My Team (Manager Insight)"
      subtitle="Phase II: Managers can view a non-sensitive summary of direct reports."
    >
      <ManagerTeamDemoPage />
    </Card>
  );
}
