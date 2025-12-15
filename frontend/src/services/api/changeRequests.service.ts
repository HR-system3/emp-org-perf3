// ./src/services/api/changeRequests.service.ts
import axiosInstance from "./axios.config";
import type {
  EmployeeProfileChangeRequest,
  ProfileChangeStatus,
  ChangeRequestCategory,
} from "@/types/employeeProfile";

// Keep your existing service object, but type it to what the UI uses
export const changeRequestsService = {
  async getAllChangeRequests(
    status?: ProfileChangeStatus
  ): Promise<EmployeeProfileChangeRequest[]> {
    const res = await axiosInstance.get<EmployeeProfileChangeRequest[]>(
      "/organization-structure/change-requests",
      { params: status ? { status } : undefined }
    );
    return res.data;
  },

  async getChangeRequestById(id: string): Promise<EmployeeProfileChangeRequest> {
    const res = await axiosInstance.get<EmployeeProfileChangeRequest>(
      `/organization-structure/change-requests/${id}`
    );
    return res.data;
  },

  async createChangeRequest(dto: {
    employeeProfileId: string;
    category: ChangeRequestCategory;
    reason?: string;
    requestedChanges: Record<string, any>;
  }): Promise<EmployeeProfileChangeRequest> {
    const res = await axiosInstance.post<EmployeeProfileChangeRequest>(
      "/organization-structure/change-requests",
      dto
    );
    return res.data;
  },

  async approveChangeRequest(
    id: string,
    dto: { status: ProfileChangeStatus; appliedChanges?: Record<string, any> }
  ): Promise<EmployeeProfileChangeRequest> {
    const res = await axiosInstance.post<EmployeeProfileChangeRequest>(
      `/organization-structure/change-requests/${id}/approve`,
      dto
    );
    return res.data;
  },
};

// ✅ Named exports expected by your components
export async function listChangeRequests(status?: ProfileChangeStatus) {
  return changeRequestsService.getAllChangeRequests(status);
}

export async function submitChangeRequest(
  employeeProfileId: string,
  dto: {
    category: ChangeRequestCategory;
    reason?: string;
    requestedChanges: Record<string, any>;
  }
) {
  return changeRequestsService.createChangeRequest({ employeeProfileId, ...dto });
}

export async function processChangeRequest(
  id: string,
  payload: { status: ProfileChangeStatus; appliedChanges?: Record<string, any> }
) {
  return changeRequestsService.approveChangeRequest(id, payload);
}