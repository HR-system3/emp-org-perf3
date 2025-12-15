//.src/hooks/useAuth.ts  

"use client";

import { useEffect, useState } from "react";

export type Role = "Employee" | "Manager" | "HR" | "Admin";

export type AuthState = {
  role: Role;
  userId?: string;
  email?: string;
  loggedInAt?: string;
};

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hr_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (profileError: any) {
          console.error('Profile fetch error:', profileError);
          // If token is invalid/expired, remove it
          if (profileError.response?.status === 401) {
            authService.removeToken();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // For other errors, still consider authenticated if token exists
            setIsAuthenticated(true);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      authService.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      authService.setToken(response.access_token);
      setUser(response.user);
      setIsAuthenticated(true);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
