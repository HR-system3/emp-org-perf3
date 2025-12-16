'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalTemplate } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading templates..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal Templates</h1>
          <p className="text-gray-600 mt-1">Manage performance appraisal templates</p>
        </div>
        {hasPermission(user?.role || '', 'canCreateTemplates') && (
          <Button onClick={() => router.push('/performance/templates/new')}>
            Create Template
          </Button>
        )}
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {templates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No templates found</p>
            {hasPermission(user?.role || '', 'canCreateTemplates') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/performance/templates/new')}
              >
                Create First Template
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card
              key={template._id}
              onClick={() => router.push(`/performance/templates/${template._id}`)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {template.description && (
                    <p className="text-gray-600 mt-1">{template.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>Type: {template.templateType.replace(/_/g, ' ')}</span>
                    <span>Criteria: {template.criteria.length}</span>
                    <span>Created: {formatDate(template.createdAt)}</span>
                    <span className={template.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {hasPermission(user?.role || '', 'canUpdateTemplates') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/performance/templates/${template._id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

