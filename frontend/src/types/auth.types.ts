// ./src/types/auth.types.ts

export type Role = "Employee" | "Manager" | "HR" | "Admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;

  // optional legacy fields (so old code doesn't break)
  _id?: string;
  userId?: string;

  positionId?: string;
  departmentId?: string;
  managerId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}