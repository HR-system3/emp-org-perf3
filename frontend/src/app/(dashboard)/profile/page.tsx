// ./src/app/(dashboard)/profile/page.tsx 

"use client";

import Card from "@/components/common/Card";
import SelfServiceProfileDemoPage from "@/app/employee-profile/self-demo/page";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MyProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
    <Card
      title="My Profile (Self-Service)"
      subtitle="Phase I: Employee views profile and updates non-critical fields (email/phone/address/biography)."
    >
      <div className="text-muted" style={{ marginBottom: 10 }}>
        Tip: if you saved your EmployeeProfile _id in Login, you can paste it here quickly.
      </div>
      {/* Reuse your existing demo page */}
      <SelfServiceProfileDemoPage />
    </Card>
    </ProtectedRoute>
  );
}
