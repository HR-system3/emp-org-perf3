'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { CreateAppraisalCycleDto, AppraisalTemplateType } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateCyclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAppraisalCycleDto>({
    name: '',
    description: '',
    cycleType: AppraisalTemplateType.ANNUAL,
    startDate: '',
    endDate: '',
    managerDueDate: '',
    employeeAcknowledgementDueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await performanceService.createCycle(formData);
      router.push('/performance/cycles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Appraisal Cycle</h1>
          <p className="text-gray-600 mt-1">Define a new performance appraisal cycle</p>
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
                Cycle Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Q1 2024 Annual Review"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cycle Type *
              </label>
              <select
                required
                value={formData.cycleType}
                onChange={(e) => setFormData({ ...formData, cycleType: e.target.value as AppraisalTemplateType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(AppraisalTemplateType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Due Date
                </label>
                <input
                  type="date"
                  value={formData.managerDueDate || ''}
                  onChange={(e) => setFormData({ ...formData, managerDueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Acknowledgement Due Date
                </label>
                <input
                  type="date"
                  value={formData.employeeAcknowledgementDueDate || ''}
                  onChange={(e) => setFormData({ ...formData, employeeAcknowledgementDueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={loading}>
                Create Cycle
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

