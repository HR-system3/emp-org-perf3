'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import { positionsService } from '@/services/api/positions.service';
import { departmentsService } from '@/services/api/departments.service';
import { CreatePositionDTO, PositionStatus, Position } from '@/types/position.types';

export default function CreatePositionPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState<CreatePositionDTO>({
    positionId: '',
    code: '',
    title: '',
    jobKey: '',
    departmentId: '',
    payGradeId: '',
    reportsToPositionId: '',
    costCenter: '',
    status: PositionStatus.VACANT,
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [deps, pos] = await Promise.all([
          departmentsService.getAllDepartments(),
          positionsService.getAllPositions(),
        ]);
        setDepartments(deps);
        setPositions(pos);
        setError('');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load reference data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof CreatePositionDTO, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await positionsService.createPosition(form);
      router.push('/positions');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create position');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        ← Back
      </Button>

      <Card title="Create Position">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position ID</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.positionId}
                onChange={(e) => handleChange('positionId', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Key</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.jobKey}
                onChange={(e) => handleChange('jobKey', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={form.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Grade (optional)</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.payGradeId}
                onChange={(e) => handleChange('payGradeId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reports To (optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={form.reportsToPositionId || ''}
                onChange={(e) => handleChange('reportsToPositionId', e.target.value)}
              >
                <option value="">None (top-level)</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.costCenter}
                onChange={(e) => handleChange('costCenter', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={form.status || PositionStatus.VACANT}
                onChange={(e) => handleChange('status', e.target.value as PositionStatus)}
              >
                {Object.values(PositionStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Position'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/positions')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
