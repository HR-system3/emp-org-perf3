'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { usersService } from '@/services/api/users.service';
import { CreateUserDTO } from '@/types/user.types';
import { useAuth } from '@/hooks/useAuth';

const ROLE_OPTIONS = [
  'department employee',
  'department head',
  'HR Manager',
  'HR Employee',
  'HR Admin',
  'Payroll Specialist',
  'Payroll Manager',
  'System Admin',
  'Legal & Policy Admin',
  'Recruiter',
  'Finance Staff',
  'Job Candidate',
];

export default function SystemAdminCreateUserPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateUserDTO>({
    name: '',
    email: '',
    password: '',
    role: 'department employee',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isSystemAdmin = normalizedRole === 'system admin';

  useEffect(() => {
    if (!isSystemAdmin) {
      setError('Only System Admin can create auth users.');
    }
  }, [isSystemAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSystemAdmin) return;

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await usersService.createUserAdmin(formData);
      alert('User created successfully!');
      router.push('/users');
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.message) {
        const validationErrors = err.response.data.message;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors
            .map((error: any) => {
              if (typeof error === 'string') return error;
              return Object.values(error.constraints || {}).join(', ');
            })
            .join('\n');
          setError(errorMessages);
        } else {
          setError(validationErrors);
        }
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to create user',
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSystemAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message={error || 'Only System Admin can access this page.'} />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Users
        </Button>
      </div>

      <Card title="Create Auth User (System Admin)">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create User'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
