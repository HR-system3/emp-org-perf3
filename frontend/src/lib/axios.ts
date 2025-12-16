// ./src/lib/axios.ts
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://emp-org-perf3.onrender.com";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Token added to request:', {
        url: config.url,
        hasToken: !!token,
        tokenLength: token.length,
      });
    } else {
      console.warn('[Axios] No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // Note: 403 errors are handled in individual components to show user-friendly messages
    
    return Promise.reject(error);
  }
);

export { api };
export default api;