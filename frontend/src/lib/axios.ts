// ./src/lib/axios.ts
console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);

import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://emp-org-perf3.onrender.com";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

