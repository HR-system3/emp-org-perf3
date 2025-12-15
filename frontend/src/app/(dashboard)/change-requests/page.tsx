// ./src/app/(dashboard)/change-requests/page.tsx 

"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/common/Card";
import ChangeRequestList from "@/components/change-requests/ChangeRequestList";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGate from "@/components/auth/RoleGate";

export default function ChangeRequestsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute allowRoles={["HR", "Admin"]}>
    <Card
      title="Change Requests (HR/Admin)"
      subtitle="Phase III: HR reviews pending requests and approves/rejects via workflow."
    >
      <div className="text-muted">
        Click a request row to open the Approve page. Or use Submit page to create a request.
      </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <RoleGate allowRoles={["Employee", "Manager"]}>
                <button className="btn" onClick={() => router.push("/dashboard/change-requests/submit")}>
                    Submit Request (Employee)
                </button>
            </RoleGate>

            <RoleGate allowRoles={["HR", "Admin"]}>
                <button className="btn btn-ghost" onClick={() => router.push("/dashboard/change-requests/approve")}>
                    Approve/Reject (HR)
                </button>
            </RoleGate>
        </div>

      <ChangeRequestList
        onSelect={(cr) => router.push(`/dashboard/change-requests/approve?requestId=${encodeURIComponent(cr._id)}`)}
      />
    </Card>
    </ProtectedRoute>
  );
}
