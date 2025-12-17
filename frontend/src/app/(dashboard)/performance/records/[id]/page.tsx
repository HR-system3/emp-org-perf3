'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalRecord, AppraisalTemplate, UpdateAppraisalRecordDto, AppraisalRecordStatus, PublishAppraisalRecordDto, AcknowledgeAppraisalRecordDto } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { isEmployee, isManager, isHRAdmin } from '@/lib/performanceRoles';

export default function RecordDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [record, setRecord] = useState<AppraisalRecord | null>(null);
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateAppraisalRecordDto>({});
  const [publishData, setPublishData] = useState<PublishAppraisalRecordDto>({ publishedByEmployeeId: '' });
  const [acknowledgeData, setAcknowledgeData] = useState<AcknowledgeAppraisalRecordDto>({ employeeAcknowledgementComment: '' });

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const recordData = await performanceService.getRecord(id);
      setRecord(recordData);
      if (recordData.templateId) {
        const templateData = await performanceService.getTemplate(recordData.templateId);
        setTemplate(templateData);
      }
      setFormData({
        ratings: recordData.ratings,
        managerSummary: recordData.managerSummary,
        strengths: recordData.strengths,
        improvementAreas: recordData.improvementAreas,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      await performanceService.updateRecord(id, formData);
      await loadRecord();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit this appraisal? It cannot be edited after submission.')) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await performanceService.submitByManager(id);
      await loadRecord();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit record');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!publishData.publishedByEmployeeId) {
      setError('Please enter your employee ID');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await performanceService.publishRecord(id, publishData);
      await loadRecord();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish record');
    } finally {
      setSaving(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setSaving(true);
      setError(null);
      await performanceService.acknowledgeRecord(id, acknowledgeData);
      await loadRecord();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge record');
    } finally {
      setSaving(false);
    }
  };

  const updateRating = (index: number, field: string, value: any) => {
    if (!formData.ratings) return;
    const newRatings = [...formData.ratings];
    newRatings[index] = { ...newRatings[index], [field]: value };
    setFormData({ ...formData, ratings: newRatings });
  };

  if (loading) {
    return <Loading text="Loading record..." />;
  }

  if (error && !record) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} />
        <Button onClick={() => router.push('/performance/records')}>
          Back to Records
        </Button>
      </div>
    );
  }

  if (!record || !template) {
    return <Loading text="Loading..." />;
  }

  // Role-based permissions
  // Managers can edit and submit records
  const canEdit = 
    (isManager(user?.role) || isHRAdmin(user?.role)) && 
    record.status === AppraisalRecordStatus.DRAFT;
  const canSubmit = 
    (isManager(user?.role) || isHRAdmin(user?.role)) && 
    record.status === AppraisalRecordStatus.DRAFT;
  // Only HR Admin can publish records
  const canPublish = 
    isHRAdmin(user?.role) && 
    record.status === AppraisalRecordStatus.MANAGER_SUBMITTED;
  // Only Employees can acknowledge their own records
  const canAcknowledge =
    isEmployee(user?.role) &&
    record.status === AppraisalRecordStatus.HR_PUBLISHED && 
    !record.employeeAcknowledgedAt &&
    record.employeeProfileId === user?.id;
  // Only Employees can raise disputes on their own published appraisals
  const canRaiseDispute = 
    isEmployee(user?.role) &&
    record.status === AppraisalRecordStatus.HR_PUBLISHED &&
    record.employeeProfileId === user?.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Appraisal Record</h1>
            <PerformanceStatusBadge status={record.status} type="record" />
          </div>
          <p className="text-gray-600 mt-1">Record Details</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/performance/records')}>
          Back
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid gap-6">
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <p className="text-gray-900">{record.employeeProfileId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Manager ID</label>
                <p className="text-gray-900">{record.managerProfileId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-gray-900">{template.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Score</label>
                <p className="text-gray-900 font-bold">{record.totalScore?.toFixed(2) || 'N/A'}</p>
              </div>
              {record.managerSubmittedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted At</label>
                  <p className="text-gray-900">{formatDate(record.managerSubmittedAt)}</p>
                </div>
              )}
              {record.hrPublishedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Published At</label>
                  <p className="text-gray-900">{formatDate(record.hrPublishedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Ratings">
          <div className="space-y-4">
            {record.ratings.map((rating, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="mb-2">
                  <h4 className="font-medium text-gray-900">{rating.title}</h4>
                </div>
                {isEditing && canEdit ? (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <input
                        type="number"
                        min={template.ratingScale.min}
                        max={template.ratingScale.max}
                        value={formData.ratings?.[index]?.ratingValue || rating.ratingValue}
                        onChange={(e) => updateRating(index, 'ratingValue', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments
                      </label>
                      <textarea
                        value={formData.ratings?.[index]?.comments || rating.comments || ''}
                        onChange={(e) => updateRating(index, 'comments', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-sm text-gray-500">Rating: </span>
                      <span className="font-medium">{rating.ratingValue}</span>
                      {rating.ratingLabel && (
                        <span className="text-gray-600 ml-2">({rating.ratingLabel})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Comments: </span>
                      <span className="text-gray-900">{rating.comments || 'None'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Summary">
          {isEditing && canEdit ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Summary
                </label>
                <textarea
                  value={formData.managerSummary || record.managerSummary || ''}
                  onChange={(e) => setFormData({ ...formData, managerSummary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths
                </label>
                <textarea
                  value={formData.strengths || record.strengths || ''}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  value={formData.improvementAreas || record.improvementAreas || ''}
                  onChange={(e) => setFormData({ ...formData, improvementAreas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Manager Summary</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{record.managerSummary || 'None'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Strengths</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{record.strengths || 'None'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Areas for Improvement</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{record.improvementAreas || 'None'}</p>
              </div>
            </div>
          )}
        </Card>

        {record.employeeAcknowledgementComment && (
          <Card title="Employee Acknowledgement">
            <div>
              <label className="text-sm font-medium text-gray-500">Comment</label>
              <p className="text-gray-900 mt-1">{record.employeeAcknowledgementComment}</p>
            </div>
            {record.employeeAcknowledgedAt && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-500">Acknowledged At</label>
                <p className="text-gray-900 mt-1">{formatDate(record.employeeAcknowledgedAt)}</p>
              </div>
            )}
          </Card>
        )}

        <Card>
          <div className="flex flex-wrap gap-4 items-start">
            {isEditing && canEdit ? (
              <>
                <Button onClick={handleUpdate} isLoading={saving}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
                {canSubmit && (
                  <Button onClick={handleSubmit} isLoading={saving}>
                    Submit Appraisal
                  </Button>
                )}
                {canPublish && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Your Employee ID"
                      value={publishData.publishedByEmployeeId}
                      onChange={(e) => setPublishData({ publishedByEmployeeId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <Button onClick={handlePublish} isLoading={saving}>
                      Publish
                    </Button>
                  </div>
                )}
                {canAcknowledge && (
                  <div className="flex-1 space-y-2">
                    <textarea
                      placeholder="Acknowledgement comment (optional)"
                      value={acknowledgeData.employeeAcknowledgementComment || ''}
                      onChange={(e) => setAcknowledgeData({ employeeAcknowledgementComment: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <Button onClick={handleAcknowledge} isLoading={saving}>
                      Acknowledge
                    </Button>
                  </div>
                )}
                {canRaiseDispute && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/performance/disputes/new?appraisalId=${record._id}&assignmentId=${record.assignmentId}&cycleId=${record.cycleId}&employeeId=${record.employeeProfileId}`,
                      )
                    }
                  >
                    Raise Dispute
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

