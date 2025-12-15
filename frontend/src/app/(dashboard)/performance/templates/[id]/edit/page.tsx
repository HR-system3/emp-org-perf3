'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalTemplate, UpdateAppraisalTemplateDto, AppraisalTemplateType, AppraisalRatingScaleType } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [formData, setFormData] = useState<UpdateAppraisalTemplateDto>({
    name: '',
    description: '',
    templateType: AppraisalTemplateType.ANNUAL,
    ratingScale: {
      type: AppraisalRatingScaleType.FIVE_POINT,
      min: 1,
      max: 5,
      step: 1,
      labels: [],
    },
    criteria: [],
    instructions: '',
    isActive: true,
  });

  const [newCriterion, setNewCriterion] = useState({
    key: '',
    title: '',
    details: '',
    weight: 0,
    maxScore: 0,
    required: false,
  });

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getTemplate(id);
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description,
        templateType: data.templateType,
        ratingScale: data.ratingScale,
        criteria: data.criteria,
        instructions: data.instructions,
        isActive: data.isActive,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await performanceService.updateTemplate(id, formData);
      router.push(`/performance/templates/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const addCriterion = () => {
    if (!newCriterion.key || !newCriterion.title) {
      setError('Key and title are required for criteria');
      return;
    }
    setFormData({
      ...formData,
      criteria: [...(formData.criteria || []), { ...newCriterion }],
    });
    setNewCriterion({
      key: '',
      title: '',
      details: '',
      weight: 0,
      maxScore: 0,
      required: false,
    });
  };

  const removeCriterion = (index: number) => {
    setFormData({
      ...formData,
      criteria: (formData.criteria || []).filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <Loading text="Loading template..." />;
  }

  if (error && !template) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} />
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
          <p className="text-gray-600 mt-1">Update template details</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Type *
              </label>
              <select
                required
                value={formData.templateType}
                onChange={(e) => setFormData({ ...formData, templateType: e.target.value as AppraisalTemplateType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(AppraisalTemplateType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Scale</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale Type *
                  </label>
                  <select
                    required
                    value={formData.ratingScale?.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ratingScale: {
                          ...formData.ratingScale!,
                          type: e.target.value as AppraisalRatingScaleType,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.values(AppraisalRatingScaleType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.ratingScale?.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ratingScale: { ...formData.ratingScale!, min: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.ratingScale?.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ratingScale: { ...formData.ratingScale!, max: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step
                  </label>
                  <input
                    type="number"
                    value={formData.ratingScale?.step || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ratingScale: { ...formData.ratingScale!, step: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Criteria</h3>
              
              {formData.criteria && formData.criteria.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{criterion.title}</span>
                        {criterion.weight && <span className="text-sm text-gray-500 ml-2">(Weight: {criterion.weight}%)</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
                    <input
                      type="text"
                      value={newCriterion.key}
                      onChange={(e) => setNewCriterion({ ...newCriterion, key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newCriterion.title}
                      onChange={(e) => setNewCriterion({ ...newCriterion, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <input
                      type="text"
                      value={newCriterion.details}
                      onChange={(e) => setNewCriterion({ ...newCriterion, details: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newCriterion.weight}
                      onChange={(e) => setNewCriterion({ ...newCriterion, weight: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                    <input
                      type="number"
                      value={newCriterion.maxScore}
                      onChange={(e) => setNewCriterion({ ...newCriterion, maxScore: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCriterion.required}
                        onChange={(e) => setNewCriterion({ ...newCriterion, required: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={addCriterion}>
                  Add Criterion
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={saving}>
                Update Template
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

