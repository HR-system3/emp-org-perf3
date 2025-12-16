import { api } from '@/lib/axios';

export interface SystemInfo {
  environment: string;
  nodeVersion: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    external: number;
  };
  apiVersion: string;
  database: {
    connected: boolean;
  };
}

export interface FeatureFlags {
  enableOrgChartCache: boolean;
  enableAuditLogging: boolean;
  enablePerformanceManagement: boolean;
  enableLeaveManagement: boolean;
  enablePayrollIntegration: boolean;
}

export interface AdminToolResult {
  success: boolean;
  message: string;
  stats?: any;
  issues?: string[];
  warnings?: string[];
  status?: string;
  error?: string;
}

export const systemAdminService = {
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await api.get<SystemInfo>('/system-admin/system-info');
    return response.data;
  },

  async getFeatureFlags(): Promise<FeatureFlags> {
    const response = await api.get<FeatureFlags>('/system-admin/feature-flags');
    return response.data;
  },

  async recalculateOrgChart(): Promise<AdminToolResult> {
    const response = await api.post<AdminToolResult>('/system-admin/tools/recalculate-org-chart');
    return response.data;
  },

  async dataIntegrityCheck(): Promise<AdminToolResult> {
    const response = await api.post<AdminToolResult>('/system-admin/tools/data-integrity-check');
    return response.data;
  },
};
