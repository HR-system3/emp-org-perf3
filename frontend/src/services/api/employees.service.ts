// ./src/services/api/employees.Service.ts 

import api from "./axios.config";
import axiosInstance from "./axios.config";
import type {
  EmployeeProfile,
  CreateEmployeeProfileDto,
  SelfServiceUpdateProfileDto,
} from "@/types/employeeProfile";

export async function listEmployees(search?: string) {
  const res = await axiosInstance.get<EmployeeProfile[]>("/employee-profile", {
    params: { search: search || undefined },
  });
  return res.data;
}

export async function getEmployeeById(id: string) {
  const res = await axiosInstance.get<EmployeeProfile>(`/employee-profile/${id}`);
  return res.data;
}

export async function createEmployee(payload: CreateEmployeeProfileDto) {
  const res = await axiosInstance.post<EmployeeProfile>("/employee-profile", payload);
  return res.data;
}

export async function getSelfProfile(employeeId: string) {
  const res = await axiosInstance.get<EmployeeProfile>(`/employee-profile/${employeeId}/self`);
  return res.data;
}

export async function updateSelfProfile(employeeId: string, payload: SelfServiceUpdateProfileDto) {
  const res = await axiosInstance.patch<EmployeeProfile>(`/employee-profile/${employeeId}/self`, payload);
  return res.data;
}

export async function getManagerTeam(managerId: string) {
  const res = await axiosInstance.get<EmployeeProfile[]>(`/employee-profile/manager/${managerId}/team`);
  return res.data;
}

export async function getEmployeeByNumber(employeeNumber: string) {
  const res = await axiosInstance.get<EmployeeProfile>(`/employee-profile/employee-number/${employeeNumber}`);
  return res.data;
}

// ✅ what OrgChartPage needs:
export const employeesService = {
  async getHierarchy() {
    const res = await axiosInstance.get("/organization-structure/employees/hierarchy");
    return res.data;
  },
};