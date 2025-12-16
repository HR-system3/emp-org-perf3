'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { usersService } from '@/services/api/users.service';
import { CreateUserDTO } from '@/types/user.types';
import { useAuth } from '@/hooks/useAuth';
// Role options for the dropdown
const ROLE_OPTIONS = [
  { value: 'department employee', label: 'Department Employee' },
  { value: 'department head', label: 'Department Head' },
  { value: 'HR Manager', label: 'HR Manager' },
  { value: 'HR Employee', label: 'HR Employee' },
  { value: 'HR Admin', label: 'HR Admin' },
  { value: 'Payroll Specialist', label: 'Payroll Specialist' },
  { value: 'Payroll Manager', label: 'Payroll Manager' },
  { value: 'System Admin', label: 'System Admin' },
  { value: 'Legal & Policy Admin', label: 'Legal & Policy Admin' },
  { value: 'Recruiter', label: 'Recruiter' },
  { value: 'Finance Staff', label: 'Finance Staff' },
  { value: 'Job Candidate', label: 'Job Candidate' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateUserDTO>({
    name: '',
    email: '',
    password: '',
    role: 'department employee',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is System Admin
    const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
    const isSystemAdmin = normalizedRole === 'system admin';
    
    if (!isSystemAdmin) {
      setError('You do not have permission to create users. Only System Admins can access this page.');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await usersService.createUser(formData);
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
            'Failed to create user'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isSystemAdmin = normalizedRole === 'system admin';

  if (!isSystemAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message="You do not have permission to create users. Only System Admins can access this page." />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Users
        </Button>
      </div>

      <Card title="Create New User">
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
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (user can log in)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Create User
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
