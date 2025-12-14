// .src/services/api/departments.service.ts

import { api } from "@/lib/axios";

/**
 * NOTE:
 * Organization Structure is NOT part of this milestone.
 * These functions exist only to prevent import/build errors.
 */

export async function listDepartments() {
  try {
    const res = await api.get("/departments");
    return res.data;
  } catch {
    // Safe fallback so UI does not crash
    return [];
  }
}

export async function getDepartmentById(departmentId: string) {
  if (!departmentId) return null;

  try {
    const res = await api.get(`/departments/${departmentId}`);
    return res.data;
  } catch {
    return null;
  }
}