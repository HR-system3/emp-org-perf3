"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/common/Card";

type Department = {
  id: string;
  name: string;
  description?: string;
};

export default function DepartmentCard({ department }: { department: Department }) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/departments/${department.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(`/departments/${department.id}`);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{department.name}</h3>
            {department.description && (
              <p className="text-sm text-gray-600">{department.description}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}