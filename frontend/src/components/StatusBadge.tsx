// src/components/StatusBadge.tsx

"use client";

import { EmployeeStatus, ProfileChangeStatus } from "@/types/employeeProfile";

type Props = {
  kind: "employee" | "changeRequest";
  value: EmployeeStatus | ProfileChangeStatus;
};

export default function StatusBadge({ kind, value }: Props) {
  const lower = String(value).toLowerCase();

  let className = "badge";
  if (kind === "employee") {
    if (value === "ACTIVE") className += " badge--active";
    else if (value === "ON_LEAVE") className += " badge--pending";
    else if (value === "TERMINATED") className += " badge--terminated";
    else className += " badge--inactive";
  } else {
    if (value === "PENDING") className += " badge--pending";
    else if (value === "APPROVED") className += " badge--approved";
    else if (value === "REJECTED") className += " badge--rejected";
    else className += " badge--inactive";
  }

  return (
    <span className={className}>
      <span className="badge-dot" />
      {lower.replace(/_/g, " ")}
    </span>
  );
}