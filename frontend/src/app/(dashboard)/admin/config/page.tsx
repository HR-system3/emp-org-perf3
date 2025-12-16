'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { systemAdminService, SystemInfo, FeatureFlags, AdminToolResult } from '@/services/api/systemAdmin.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';

export default function SystemAdminConfigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toolResult, setToolResult] = useState<AdminToolResult | null>(null);
  const [isRunningTool, setIsRunningTool] = useState(false);

  useEffect(() => {
    // Check if user is System Admin
    const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
    const isSystemAdmin = normalizedRole === 'system admin';
    
    if (!isSystemAdmin) {
      setError('You do not have permission to access this page. Only System Admins can access system configuration.');
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [info, flags] = await Promise.all([
        systemAdminService.getSystemInfo(),
        systemAdminService.getFeatureFlags(),
      ]);
      setSystemInfo(info);
      setFeatureFlags(flags);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load system information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateOrgChart = async () => {
    if (!confirm('This will recalculate the organization chart cache. Continue?')) {
      return;
    }

    try {
      setIsRunningTool(true);
      setToolResult(null);
      setError('');
      const result = await systemAdminService.recalculateOrgChart();
      setToolResult(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to recalculate org chart');
    } finally {
      setIsRunningTool(false);
    }
  };

  const handleDataIntegrityCheck = async () => {
    try {
      setIsRunningTool(true);
      setToolResult(null);
      setError('');
      const result = await systemAdminService.dataIntegrityCheck();
      setToolResult(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run data integrity check');
    } finally {
      setIsRunningTool(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading system configuration..." />;
  }

  const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isSystemAdmin = normalizedRole === 'system admin';

  if (!isSystemAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You do not have permission to access this page. Only System Admins can access system configuration." />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600 mt-2">Manage system configuration and run administrative tools</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* System Information */}
      {systemInfo && (
        <Card title="System Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Environment</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemInfo.environment.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">API Version</p>
              <p className="text-lg font-semibold text-gray-900">{systemInfo.apiVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Node.js Version</p>
              <p className="text-lg font-semibold text-gray-900">{systemInfo.nodeVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatUptime(systemInfo.uptime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Memory Usage</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemInfo.memory.used} MB / {systemInfo.memory.total} MB
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Database Status</p>
              <p className="text-lg font-semibold text-gray-900">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    systemInfo.database.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {systemInfo.database.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm text-gray-900">
                {formatDateTime(systemInfo.timestamp)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Feature Flags */}
      {featureFlags && (
        <Card title="Feature Flags">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Admin Tools */}
      <Card title="Administrative Tools">
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recalculate Organization Chart
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Rebuilds the organization chart hierarchy cache. This is safe to run and will not modify any data.
            </p>
            <Button
              onClick={handleRecalculateOrgChart}
              isLoading={isRunningTool}
              disabled={isRunningTool}
              variant="secondary"
            >
              Recalculate Org Chart
            </Button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Data Integrity Check
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Checks for data integrity issues such as invalid references, circular relationships, and missing required fields.
            </p>
            <Button
              onClick={handleDataIntegrityCheck}
              isLoading={isRunningTool}
              disabled={isRunningTool}
              variant="secondary"
            >
              Run Integrity Check
            </Button>
          </div>

          {toolResult && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                toolResult.success
                  ? toolResult.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : toolResult.status === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <h4 className="font-semibold mb-2">
                {toolResult.success ? '✓ Operation Completed' : '✗ Operation Failed'}
              </h4>
              <p className="text-sm mb-3">{toolResult.message}</p>

              {toolResult.stats && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm font-medium mb-2">Statistics:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(toolResult.stats).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {toolResult.issues && toolResult.issues.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-300">
                  <p className="text-sm font-medium text-red-800 mb-2">Issues Found:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {toolResult.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {toolResult.warnings && toolResult.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {toolResult.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
