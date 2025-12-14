// ./src/app/(dashboard)/change-requests/submit/page.tsx 

"use client";

import { useState } from "react";
import Card from "@/components/common/Card";
import ChangeRequestForm from "@/components/change-requests/ChangeRequestForm";
import useAuth from "@/hooks/useAuth";
import { EmployeeProfileChangeRequest } from "@/types/employeeProfile";

export default function SubmitChangeRequestPage() {
  const { auth } = useAuth();
  const [employeeId, setEmployeeId] = useState(auth?.userId || "");
  const [created, setCreated] = useState<EmployeeProfileChangeRequest | null>(null);

  return (
    <Card title="Submit Change Request" subtitle="Employee submits a governed change request (HR approval required).">
      <div className="form-row" style={{ maxWidth: 520 }}>
        <label>EmployeeProfile _id</label>
        <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Paste employee profile _id" />
      </div>

      {employeeId && (
        <ChangeRequestForm
          employeeId={employeeId}
          onCreated={(cr) => {
            setCreated(cr);
          }}
        />
      )}

      {created && (
        <div className="result-block" style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 8 }}>Created Request</h2>
          <pre>{JSON.stringify(created, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
}
