'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import { departmentsService } from '@/services/api/departments.service';
import { positionsService } from '@/services/api/positions.service';
import { CreateDepartmentDTO } from '@/types/department.types';
import { Position } from '@/types/position.types';

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState<CreateDepartmentDTO>({
    code: '',
    name: '',
    description: '',
    costCenter: '',
    headPositionId: '',
    deptId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const pos = await positionsService.getAllPositions();
        setPositions(pos);
        setError('');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load positions');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof CreateDepartmentDTO, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await departmentsService.createDepartment(form);
      router.push('/departments');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create department');
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

      <Card title="Create Department">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dept ID (optional)</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.deptId || ''}
                onChange={(e) => handleChange('deptId', e.target.value)}
                placeholder="Auto if blank"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Head Position (optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={form.headPositionId || ''}
                onChange={(e) => handleChange('headPositionId', e.target.value)}
              >
                <option value="">None</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.code})
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
              {saving ? 'Creating...' : 'Create Department'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/departments')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
