'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { usersService } from '@/services/api/users.service';
import { User, UpdateUserDTO, AssignRoleDTO } from '@/types/user.types';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';

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

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserDTO>({
    name: '',
    email: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const normalizedRole = (currentUser?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isSystemAdmin = normalizedRole === 'system admin';
  const isHrManager = normalizedRole === 'hr manager';

  useEffect(() => {
    // Allow System Admin and HR Manager (HR Manager can assign roles only)
    if (!isSystemAdmin && !isHrManager) {
      setError('You do not have permission to edit users. Only System Admins or HR Managers can access this page.');
      setIsLoading(false);
      return;
    }

    if (id) {
      fetchUser();
    }
  }, [id, isSystemAdmin, isHrManager]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await usersService.getUserById(id);
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSystemAdmin) {
      setError('Only System Admins can update user details. HR Managers can assign roles only.');
      return;
    }
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const updateData: UpdateUserDTO = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      
      // Only include password if it's being changed
      if (formData.password && formData.password.length > 0) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsSaving(false);
          return;
        }
        updateData.password = formData.password;
      }

      await usersService.updateUser(id, updateData);
      await fetchUser();
      setError(''); // Clear any previous errors
      alert('User updated successfully!');
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
            'Failed to update user'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignRole = async () => {
    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await usersService.assignRole(id, { role: formData.role });
      await fetchUser();
      alert('Role assigned successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!isSystemAdmin) {
      setError('Only System Admins can activate users.');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      await usersService.activateUser(id);
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!isSystemAdmin) {
      setError('Only System Admins can deactivate users.');
      return;
    }
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      await usersService.deactivateUser(id);
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading user..." />;
  }

  if (!isSystemAdmin && !isHrManager) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message="You do not have permission to edit users. Only System Admins or HR Managers can access this page." />
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message="User not found" />
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

      <Card title="Edit User">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">User ID</p>
              <p className="font-mono text-gray-900">{user._id}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {user.createdAt && (
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900">{formatDateTime(user.createdAt)}</p>
              </div>
            )}
            {user.updatedAt && (
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDateTime(user.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
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
              disabled={!isSystemAdmin}
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
              disabled={!isSystemAdmin}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              minLength={6}
              disabled={!isSystemAdmin}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters (only if changing password)</p>
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

          <div className="flex gap-3 pt-4 flex-wrap">
            {isSystemAdmin && (
              <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                Update User
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleAssignRole}
              isLoading={isSaving}
              disabled={isSaving}
            >
              Assign Role Only
            </Button>
            {isSystemAdmin && (
              user.isActive ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeactivate}
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleActivate}
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  Activate
                </Button>
              )
            )}
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
