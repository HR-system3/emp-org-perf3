// ./src/services/api/ChangeRequests.Service.ts 

import api from "./axios.config";
import { EmployeeProfileChangeRequest, ProfileChangeStatus } from "@/types/employeeProfile";

export async function listChangeRequests(status?: ProfileChangeStatus) {
  const res = await api.get<EmployeeProfileChangeRequest[]>("/employee-profile/change-requests", {
    params: status ? { status } : {},
  });
  return res.data;
}

export async function submitChangeRequest(
  employeeId: string,
  payload: { category: string; reason?: string; requestedChanges: Record<string, any> }
) {
  const res = await api.post<EmployeeProfileChangeRequest>(`/employee-profile/${employeeId}/change-requests`, payload);
  return res.data;
}

export async function processChangeRequest(
  requestId: string,
  payload: { status: ProfileChangeStatus; appliedChanges?: Record<string, any> }
) {
  const res = await api.patch<EmployeeProfileChangeRequest>(`/employee-profile/change-requests/${requestId}`, payload);
  return res.data;
}
