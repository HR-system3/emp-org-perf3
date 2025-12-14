// ./src/services/api/auth.service.ts 

import api from "./axios.config";

export async function backendLogin(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}
