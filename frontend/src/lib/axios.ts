// ./src/lib/axios.ts
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://emp-org-perf3.onrender.com";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export { api };
export default api;