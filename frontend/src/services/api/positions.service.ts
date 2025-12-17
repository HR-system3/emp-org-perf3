import { api } from '@/lib/axios';
import {
  Position,
  CreatePositionDTO,
  UpdatePositionDTO,
  DelimitPositionDTO,
  PositionStatus,
} from '@/types/position.types';

type PositionApi = {
  _id: string;
  positionId: string;
  code: string;
  title: string;
  description?: string;
  jobKey: string;
  departmentId: string;
  payGradeId: string;
  reportsToPositionId?: string;
  status: PositionStatus;
  costCenter: string;
  effectiveEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapPosition(api: PositionApi): Position {
  const { _id, ...rest } = api;
  return { id: _id, ...rest };
}

export const positionsService = {
  async getAllPositions(departmentId?: string): Promise<Position[]> {
    const response = await api.get<PositionApi[]>(
      '/organization-structure/positions',
      { params: departmentId ? { departmentId } : undefined },
    );
    return response.data.map(mapPosition);
  },

  async getPositionById(id: string): Promise<Position> {
    const response = await api.get<PositionApi>(
      `/organization-structure/positions/${id}`,
    );
    return mapPosition(response.data);
  },

  async createPosition(dto: CreatePositionDTO): Promise<Position> {
    const response = await api.post<PositionApi>(
      '/organization-structure/positions',
      dto,
    );
    return mapPosition(response.data);
  },

  async updatePosition(
    id: string,
    dto: UpdatePositionDTO,
  ): Promise<Position> {
    const response = await api.put<PositionApi>(
      `/organization-structure/positions/${id}`,
      dto,
    );
    return mapPosition(response.data);
  },

  async deactivatePosition(id: string): Promise<Position> {
    const response = await api.patch<PositionApi>(
      `/organization-structure/positions/${id}/deactivate`,
    );
    return mapPosition(response.data);
  },

  async delimitPosition(
    id: string,
    dto: DelimitPositionDTO,
  ): Promise<Position> {
    const response = await api.patch<PositionApi>(
      `/organization-structure/positions/${id}/delimit`,
      dto,
    );
    return mapPosition(response.data);
  },
};



