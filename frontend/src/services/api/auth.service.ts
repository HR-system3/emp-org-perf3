//./src/services/api/auth.service.ts

import { api } from '@/lib/axios';
import { LoginRequest, LoginResponse, User } from '@/types/auth.types';

const TOKEN_KEY = 'auth_token';

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<any>('/auth/login', credentials);
    // Backend returns: { statusCode, message, user: { userid, role, name }, access_token }
    // We need: { access_token, user: User }
    const userPayload = response.data.user || {};
    return {
      access_token: response.data.access_token,
      user: {
        id: userPayload.userid || userPayload.id || '',
        email: credentials.email, // Email not in JWT payload, use from request
        name: userPayload.name || '',
        role: userPayload.role || '',
      },
    };
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Re-throw with more context
      if (error.response) {
        // Server responded with error
        throw error;
      } else if (error.request) {
        // Request made but no response (network error)
        throw new Error('Network error: Could not reach server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw error;
      }
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get<any>('/auth/me');
    // Backend returns: { id, name, email, role }
    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      role: response.data.role,
    };
  },

  logout(): void {
    this.removeToken();
    window.location.href = '/login';
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};