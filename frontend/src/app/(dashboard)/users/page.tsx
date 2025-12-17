'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { usersService } from '@/services/api/users.service';
import { User } from '@/types/user.types';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterActive, setFilterActive] = useState<string>('');

  useEffect(() => {
    // Allow System Admin and HR Manager to view/assign roles
    const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
    const isSystemAdmin = normalizedRole === 'system admin';
    const isHrManager = normalizedRole === 'hr manager';
    
    if (!isSystemAdmin && !isHrManager) {
      setError('You do not have permission to view users. Only System Admins or HR Managers can access this page.');
      setIsLoading(false);
      return;
    }

    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterActive === '') return true;
    if (filterActive === 'active') return u.isActive === true;
    if (filterActive === 'inactive') return u.isActive === false;
    return true;
  });

  const handleActivate = async (id: string) => {
    try {
      await usersService.activateUser(id);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    try {
      await usersService.deactivateUser(id);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading users..." />;
  }

  const normalizedRole = (user?.role || '').toLowerCase().replace(/_/g, ' ').trim();
  const isSystemAdmin = normalizedRole === 'system admin';
  const isHrManager = normalizedRole === 'hr manager';

  if (!isSystemAdmin && !isHrManager) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You do not have permission to view users. Only System Admins or HR Managers can access this page." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage system users and their roles</p>
        </div>
        {isSystemAdmin && (
          <Button onClick={() => router.push('/users/create')}>
            + Create User
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <div className="mb-6">
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No users found</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {u.createdAt ? formatDateTime(u.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/users/${u._id}`)}
                        >
                          View / Edit
                        </Button>
                        {isSystemAdmin && (
                          <>
                            {u.isActive ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeactivate(u._id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleActivate(u._id)}
                              >
                                Activate
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
