// ./src/app/(dashboard)/change-requests/approve/page.tsx 

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Card from "@/components/common/Card";
import ApprovalActions from "@/components/change-requests/ApprovalActions";
import { EmployeeProfileChangeRequest } from "@/types/employeeProfile";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ApproveChangeRequestPage() {
  const sp = useSearchParams();
  const prefilled = sp.get("requestId") || "";
  const [requestId, setRequestId] = useState(prefilled);
  const [updated, setUpdated] = useState<EmployeeProfileChangeRequest | null>(null);

  return (
    <ProtectedRoute allowRoles={["HR", "Admin"]}>
    <Card title="Approve / Reject Request (HR)" subtitle="HR processes a request and applies changes when approved.">
      <div className="form-row" style={{ maxWidth: 520 }}>
        <label>Request _id</label>
        <input value={requestId} onChange={(e) => setRequestId(e.target.value)} placeholder="Paste change request _id" />
        <div className="text-muted" style={{ marginTop: 6 }}>
          Tip: open Change Requests list and click a row to auto-fill.
        </div>
      </div>

      {requestId && (
        <ApprovalActions
          requestId={requestId}
          onUpdated={(cr) => {
            setUpdated(cr);
          }}
        />
      )}

      {updated && (
        <div className="result-block" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 8 }}>Updated Request</h2>
          <pre>{JSON.stringify(updated, null, 2)}</pre>
        </div>
      )}
    </Card>
    </ProtectedRoute>
  );
}
