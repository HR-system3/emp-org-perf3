'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { CreateAppraisalRecordDto, AppraisalAssignment, AppraisalTemplate, RatingEntry } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<AppraisalAssignment | null>(null);
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [formData, setFormData] = useState<CreateAppraisalRecordDto>({
    assignmentId: assignmentId || '',
    cycleId: '',
    templateId: '',
    employeeProfileId: '',
    managerProfileId: '',
    ratings: [],
    managerSummary: '',
    strengths: '',
    improvementAreas: '',
  });

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    } else {
      setLoading(false);
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const assignments = await performanceService.getAssignments({});
      const found = assignments.find((a) => a._id === assignmentId);
      if (found) {
        setAssignment(found);
        const templateData = await performanceService.getTemplate(found.templateId);
        setTemplate(templateData);
        setFormData({
          assignmentId: found._id,
          cycleId: found.cycleId,
          templateId: found.templateId,
          employeeProfileId: found.employeeProfileId,
          managerProfileId: found.managerProfileId,
          ratings: templateData.criteria.map((criterion) => ({
            key: criterion.key,
            title: criterion.title,
            ratingValue: templateData.ratingScale.min,
            comments: '',
          })),
          managerSummary: '',
          strengths: '',
          improvementAreas: '',
        });
      }
    } catch (err: any) {
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (index: number, field: keyof RatingEntry, value: any) => {
    const newRatings = [...formData.ratings];
    newRatings[index] = { ...newRatings[index], [field]: value };
    setFormData({ ...formData, ratings: newRatings });
  };

  const calculateTotalScore = () => {
    if (!template) return 0;
    let total = 0;
    formData.ratings.forEach((rating) => {
      const criterion = template.criteria.find((c) => c.key === rating.key);
      if (criterion && criterion.weight) {
        const weighted = (rating.ratingValue / template.ratingScale.max) * criterion.weight;
        total += weighted;
      } else {
        total += rating.ratingValue;
      }
    });
    return Math.round(total * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const totalScore = calculateTotalScore();
      await performanceService.createRecord({
        ...formData,
        totalScore,
      });
      router.push('/performance/records');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading assignment..." />;
  }

  if (!assignment || !template) {
    return (
      <div className="space-y-6">
        <ErrorMessage message="Assignment not found" />
        <Button onClick={() => router.push('/performance/records')}>
          Back to Records
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Appraisal Record</h1>
          <p className="text-gray-600 mt-1">Fill out the performance appraisal</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <p className="text-gray-900">{formData.employeeProfileId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-gray-900">{template.name}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings</h3>
              <div className="space-y-4">
                {formData.ratings.map((rating, index) => {
                  const criterion = template.criteria.find((c) => c.key === rating.key);
                  return (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="mb-2">
                        <h4 className="font-medium text-gray-900">{rating.title}</h4>
                        {criterion?.details && (
                          <p className="text-sm text-gray-600 mt-1">{criterion.details}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating ({template.ratingScale.min} - {template.ratingScale.max})
                          </label>
                          <input
                            type="number"
                            min={template.ratingScale.min}
                            max={template.ratingScale.max}
                            step={template.ratingScale.step || 1}
                            required
                            value={rating.ratingValue}
                            onChange={(e) => updateRating(index, 'ratingValue', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comments
                          </label>
                          <textarea
                            value={rating.comments || ''}
                            onChange={(e) => updateRating(index, 'comments', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Summary
                  </label>
                  <textarea
                    value={formData.managerSummary}
                    onChange={(e) => setFormData({ ...formData, managerSummary: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths
                  </label>
                  <textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Areas for Improvement
                  </label>
                  <textarea
                    value={formData.improvementAreas}
                    onChange={(e) => setFormData({ ...formData, improvementAreas: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Score:</span>
                <span className="text-lg font-bold text-gray-900">{calculateTotalScore().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={saving}>
                Save Draft
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

