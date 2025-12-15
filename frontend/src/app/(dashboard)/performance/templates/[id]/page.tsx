'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalTemplate } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { formatDate } from '@/lib/utils';

export default function TemplateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getTemplate(id);
      setTemplate(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading template..." />;
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error || 'Template not found'} />
        <Button onClick={() => router.push('/performance/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="text-gray-600 mt-1">Template Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/performance/templates/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push('/performance/templates')}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{template.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Template Type</label>
                <p className="text-gray-900 mt-1">{template.templateType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900 mt-1">
                  <span className={template.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900 mt-1">{formatDate(template.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 mt-1">{formatDate(template.updatedAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Rating Scale">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Scale Type</label>
                <p className="text-gray-900 mt-1">{template.ratingScale.type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Range</label>
                <p className="text-gray-900 mt-1">
                  {template.ratingScale.min} - {template.ratingScale.max}
                  {template.ratingScale.step && ` (Step: ${template.ratingScale.step})`}
                </p>
              </div>
            </div>
            {template.ratingScale.labels && template.ratingScale.labels.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Labels</label>
                <div className="flex gap-2 mt-1">
                  {template.ratingScale.labels.map((label, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {index + template.ratingScale.min}: {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title={`Evaluation Criteria (${template.criteria.length})`}>
          <div className="space-y-3">
            {template.criteria.map((criterion, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{criterion.title}</h4>
                    {criterion.details && (
                      <p className="text-sm text-gray-600 mt-1">{criterion.details}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Key: {criterion.key}</span>
                      {criterion.weight && <span>Weight: {criterion.weight}%</span>}
                      {criterion.maxScore && <span>Max Score: {criterion.maxScore}</span>}
                      {criterion.required && <span className="text-red-600">Required</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {template.instructions && (
          <Card title="Instructions">
            <p className="text-gray-900 whitespace-pre-wrap">{template.instructions}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

