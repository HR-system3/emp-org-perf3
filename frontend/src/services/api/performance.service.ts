import axiosInstance from './axios.config';
import {
  AppraisalTemplate,
  CreateAppraisalTemplateDto,
  UpdateAppraisalTemplateDto,
  AppraisalCycle,
  CreateAppraisalCycleDto,
  UpdateAppraisalCycleDto,
  CycleProgress,
  BulkAssignAppraisalsDto,
  AppraisalAssignment,
  AppraisalAssignmentStatus,
  AppraisalRecord,
  CreateAppraisalRecordDto,
  UpdateAppraisalRecordDto,
  PublishAppraisalRecordDto,
  AcknowledgeAppraisalRecordDto,
  AppraisalDispute,
  CreateDisputeDto,
  ResolveDisputeDto,
  AppraisalDisputeStatus,
} from '@/types/performance.types';

export const performanceService = {
  // Templates
  async createTemplate(dto: CreateAppraisalTemplateDto): Promise<AppraisalTemplate> {
    const response = await axiosInstance.post<AppraisalTemplate>('/performance/templates', dto);
    return response.data;
  },

  async getTemplates(): Promise<AppraisalTemplate[]> {
    const response = await axiosInstance.get<AppraisalTemplate[]>('/performance/templates');
    return response.data;
  },

  async getTemplate(id: string): Promise<AppraisalTemplate> {
    const response = await axiosInstance.get<AppraisalTemplate>(`/performance/templates/${id}`);
    return response.data;
  },

  async updateTemplate(id: string, dto: UpdateAppraisalTemplateDto): Promise<AppraisalTemplate> {
    const response = await axiosInstance.patch<AppraisalTemplate>(`/performance/templates/${id}`, dto);
    return response.data;
  },

  // Cycles
  async createCycle(dto: CreateAppraisalCycleDto): Promise<AppraisalCycle> {
    const response = await axiosInstance.post<AppraisalCycle>('/performance/cycles', dto);
    return response.data;
  },

  async getCycles(status?: string): Promise<AppraisalCycle[]> {
    const params = status ? { status } : {};
    const response = await axiosInstance.get<AppraisalCycle[]>('/performance/cycles', { params });
    return response.data;
  },

  async getCycle(id: string): Promise<AppraisalCycle> {
    const response = await axiosInstance.get<AppraisalCycle>(`/performance/cycles/${id}`);
    return response.data;
  },

  async updateCycle(id: string, dto: UpdateAppraisalCycleDto): Promise<AppraisalCycle> {
    const response = await axiosInstance.patch<AppraisalCycle>(`/performance/cycles/${id}`, dto);
    return response.data;
  },

  async getCycleProgress(id: string): Promise<CycleProgress> {
    const response = await axiosInstance.get<CycleProgress>(`/performance/cycles/${id}/progress`);
    return response.data;
  },

  // Assignments
  async bulkAssign(dto: BulkAssignAppraisalsDto): Promise<{ message: string; created: number }> {
    const response = await axiosInstance.post('/performance/assignments/bulk', dto);
    return response.data;
  },

  async getAssignments(params?: {
    cycleId?: string;
    managerProfileId?: string;
    employeeProfileId?: string;
    status?: AppraisalAssignmentStatus;
  }): Promise<AppraisalAssignment[]> {
    const response = await axiosInstance.get<AppraisalAssignment[]>('/performance/assignments', { params });
    return response.data;
  },

  // Records
  async createRecord(dto: CreateAppraisalRecordDto): Promise<AppraisalRecord> {
    const response = await axiosInstance.post<AppraisalRecord>('/performance/records', dto);
    return response.data;
  },

  async getRecord(id: string): Promise<AppraisalRecord> {
    const response = await axiosInstance.get<AppraisalRecord>(`/performance/records/${id}`);
    return response.data;
  },

  async updateRecord(id: string, dto: UpdateAppraisalRecordDto): Promise<AppraisalRecord> {
    const response = await axiosInstance.patch<AppraisalRecord>(`/performance/records/${id}`, dto);
    return response.data;
  },

  async submitByManager(id: string): Promise<AppraisalRecord> {
    const response = await axiosInstance.patch<AppraisalRecord>(`/performance/records/${id}/submit-manager`);
    return response.data;
  },

  async publishRecord(id: string, dto: PublishAppraisalRecordDto): Promise<AppraisalRecord> {
    const response = await axiosInstance.patch<AppraisalRecord>(`/performance/records/${id}/publish`, dto);
    return response.data;
  },

  async acknowledgeRecord(id: string, dto: AcknowledgeAppraisalRecordDto): Promise<AppraisalRecord> {
    const response = await axiosInstance.patch<AppraisalRecord>(`/performance/records/${id}/acknowledge`, dto);
    return response.data;
  },

  async getEmployeeRecords(employeeId: string): Promise<AppraisalRecord[]> {
    const response = await axiosInstance.get<AppraisalRecord[]>(`/performance/records/employee/${employeeId}`);
    return response.data;
  },

  // Disputes
  async createDispute(dto: CreateDisputeDto): Promise<AppraisalDispute> {
    const response = await axiosInstance.post<AppraisalDispute>('/performance/disputes', dto);
    return response.data;
  },

  async getDisputes(params?: {
    cycleId?: string;
    employeeProfileId?: string;
    status?: AppraisalDisputeStatus;
  }): Promise<AppraisalDispute[]> {
    const response = await axiosInstance.get<AppraisalDispute[]>('/performance/disputes', { params });
    return response.data;
  },

  async resolveDispute(id: string, dto: ResolveDisputeDto): Promise<AppraisalDispute> {
    const response = await axiosInstance.patch<AppraisalDispute>(`/performance/disputes/${id}/resolve`, dto);
    return response.data;
  },
};

