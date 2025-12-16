//./src/app/(dashboard)/profile/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/axios';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';
import Avatar from '@/components/Avatar';
import { EmployeeProfile } from '@/types/employeeProfile';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEmployeeProfile();
    }
  }, [authLoading, user]);

  const fetchEmployeeProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<EmployeeProfile>('/employee-profile/me/self');
      setEmployeeProfile(res.data);
    } catch (err: any) {
      console.error('Error loading employee profile:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load your employee profile. Please ensure your employee profile exists and matches your login email.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <Loading size="lg" text="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage message="You are not logged in. Please sign in to view your profile." />
      </div>
    );
  }

  if (error && !employeeProfile) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View your account details and role in the system.</p>
        </div>
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <Card title="Account Information">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.name || '-'}</dd>
            </div>
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.email}</dd>
            </div>
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.role}</dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }

  const fullName = employeeProfile
    ? `${employeeProfile.firstName} ${employeeProfile.lastName}`
    : user.name;

  // Helper to get position/department names
  const positionTitle =
    employeeProfile?.primaryPositionId &&
    typeof employeeProfile.primaryPositionId === 'object'
      ? (employeeProfile.primaryPositionId as any).title || '—'
      : '—';

  const departmentName =
    employeeProfile?.primaryDepartmentId &&
    typeof employeeProfile.primaryDepartmentId === 'object'
      ? (employeeProfile.primaryDepartmentId as any).name || '—'
      : '—';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          View your complete employee profile and account details.
        </p>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {employeeProfile ? (
        <>
          {/* Header Card with Avatar and Status */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={fullName} size={80} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {employeeProfile.employeeNumber}
                  </p>
                  {employeeProfile.status && (
                    <div className="mt-2">
                      <StatusBadge kind="employee" value={employeeProfile.status} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card title="Personal Information">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">First Name</dt>
                  <dd className="text-sm text-gray-900">{employeeProfile.firstName}</dd>
                </div>
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                  <dd className="text-sm text-gray-900">{employeeProfile.lastName}</dd>
                </div>
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">National ID</dt>
                  <dd className="text-sm text-gray-900">{employeeProfile.nationalId}</dd>
                </div>
                {employeeProfile.dateOfBirth && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(employeeProfile.dateOfBirth)}
                    </dd>
                  </div>
                )}
                {employeeProfile.biography && (
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Biography</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-line">
                      {employeeProfile.biography}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Contact Information */}
            <Card title="Contact Information">
              <dl className="divide-y divide-gray-200">
                {employeeProfile.personalEmail && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Personal Email</dt>
                    <dd className="text-sm text-gray-900">{employeeProfile.personalEmail}</dd>
                  </div>
                )}
                {employeeProfile.mobilePhone && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Mobile Phone</dt>
                    <dd className="text-sm text-gray-900">{employeeProfile.mobilePhone}</dd>
                  </div>
                )}
                {employeeProfile.homePhone && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Home Phone</dt>
                    <dd className="text-sm text-gray-900">{employeeProfile.homePhone}</dd>
                  </div>
                )}
                {employeeProfile.address && (
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Address</dt>
                    <dd className="text-sm text-gray-900">
                      {employeeProfile.address.streetAddress && (
                        <div>{employeeProfile.address.streetAddress}</div>
                      )}
                      {employeeProfile.address.city && (
                        <div>{employeeProfile.address.city}</div>
                      )}
                      {employeeProfile.address.country && (
                        <div>{employeeProfile.address.country}</div>
                      )}
                      {!employeeProfile.address.streetAddress &&
                        !employeeProfile.address.city &&
                        !employeeProfile.address.country && (
                          <span className="text-gray-400">No address provided</span>
                        )}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Employment Information */}
            <Card title="Employment Information">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Employee Number</dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {employeeProfile.employeeNumber}
                  </dd>
                </div>
                {employeeProfile.dateOfHire && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Date of Hire</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(employeeProfile.dateOfHire)}
                    </dd>
                  </div>
                )}
                {employeeProfile.contractType && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
                    <dd className="text-sm text-gray-900">
                      {employeeProfile.contractType.replace(/_/g, ' ')}
                    </dd>
                  </div>
                )}
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeProfile.status && (
                      <StatusBadge kind="employee" value={employeeProfile.status} />
                    )}
                  </dd>
                </div>
                {employeeProfile.isActive === false && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Active Status</dt>
                    <dd className="text-sm text-red-600">Inactive</dd>
                  </div>
                )}
                {employeeProfile.deactivatedAt && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Deactivated On</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(employeeProfile.deactivatedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Organizational Information */}
            <Card title="Organizational Information">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="text-sm text-gray-900">{positionTitle}</dd>
                </div>
                <div className="py-3 grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="text-sm text-gray-900">{departmentName}</dd>
                </div>
                {employeeProfile.payGradeId && (
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Pay Grade</dt>
                    <dd className="text-sm text-gray-900">
                      {typeof employeeProfile.payGradeId === 'object'
                        ? (employeeProfile.payGradeId as any).name || '—'
                        : '—'}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>

          {/* Account Information (from auth user) */}
          <Card title="Account Information">
            <dl className="divide-y divide-gray-200">
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">System Email</dt>
                <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">System Role</dt>
                <dd className="text-sm text-gray-900 col-span-2">{user.role}</dd>
              </div>
            </dl>
          </Card>
        </>
      ) : (
        // Fallback to basic account info if employee profile not found
        <Card title="Account Information">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.name || '-'}</dd>
            </div>
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.email}</dd>
            </div>
            <div className="py-4 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 col-span-2">{user.role}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

