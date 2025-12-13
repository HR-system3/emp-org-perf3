// ./src/lib/axios.ts
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://emp-org-perf3.onrender.com";

console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("API BASE URL =", baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});