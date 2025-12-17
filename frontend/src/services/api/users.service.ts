import { api } from '@/lib/axios';
import { User, CreateUserDTO, UpdateUserDTO, AssignRoleDTO } from '@/types/user.types';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(dto: CreateUserDTO): Promise<User> {
    const response = await api.post<User>('/users', dto);
    return response.data;
  },

  async createUserAdmin(dto: CreateUserDTO): Promise<User> {
    const response = await api.post<User>('/users/admin-create', dto);
    return response.data;
  },

  async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, dto);
    return response.data;
  },

  async assignRole(id: string, dto: AssignRoleDTO): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/assign-role`, dto);
    return response.data;
  },

  async activateUser(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/activate`);
    return response.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  },
};
