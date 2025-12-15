//.src/hooks/useAuth.ts  

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api/auth.service";
import type { LoginRequest, User, Role } from "@/types/auth.types";

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
  const router = useRouter();

  const [auth, setAuth] = useState<AuthState | null>(null);

  // ✅ add missing states (fixes your errors)
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuth(getAuth());
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const userData = await authService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (profileError: any) {
        console.error("Profile fetch error:", profileError);

        if (profileError.response?.status === 401) {
          authService.removeToken();
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
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
      router.push("/dashboard");
      return { success: true as const };
    } catch (error: any) {
      return {
        success: false as const,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    auth, // keeping your old state too
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}