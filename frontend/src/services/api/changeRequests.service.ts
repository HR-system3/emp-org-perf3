import axiosInstance from './axios.config';
import {
  ChangeRequest,
  CreateChangeRequestDTO,
  ApprovalDTO,
} from '@/types/changeRequest.types';

export const changeRequestsService = {
  async getAllChangeRequests(): Promise<ChangeRequest[]> {
    const response = await axiosInstance.get<ChangeRequest[]>(
      '/organization-structure/change-requests',
    );
    return response.data;
  },

  async getChangeRequestById(id: string): Promise<ChangeRequest> {
    const response = await axiosInstance.get<ChangeRequest>(
      `/organization-structure/change-requests/${id}`,
    );
    return response.data;
  },

  async createChangeRequest(
    dto: CreateChangeRequestDTO,
  ): Promise<ChangeRequest> {
    const response = await axiosInstance.post<ChangeRequest>(
      '/organization-structure/change-requests',
      dto,
    );
    return response.data;
  },

  async approveChangeRequest(
    id: string,
    dto: ApprovalDTO,
  ): Promise<ChangeRequest> {
    const response = await axiosInstance.post<ChangeRequest>(
      `/organization-structure/change-requests/${id}/approve`,
      dto,
    );
    return response.data;
  },
};


