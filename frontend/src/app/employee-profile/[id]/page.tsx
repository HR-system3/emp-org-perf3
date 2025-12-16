'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { EmployeeProfile } from '@/types/employeeProfile';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function EmployeeProfileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const { user } = useAuth();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!employeeId) {
        setError('Missing employee id in URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get<EmployeeProfile>(
          `/employee-profile/${employeeId}`
        );
        setEmployee(res.data);
      } catch (err: any) {
        console.error(err);
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          'Failed to load employee profile.';
        setError(
          typeof backendMessage === 'string'
            ? backendMessage
            : JSON.stringify(backendMessage)
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [employeeId]);

  if (loading) {
    return <Loading text="Loading employee profile..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600 mt-2">View employee profile details</p>
        </div>
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600 mt-2">View employee profile details</p>
        </div>
        <Card>
          <p className="text-gray-500">Employee not found.</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const canManageEmployee = hasPermission(user?.role || '', 'canUpdateEmployee');

  async function handleDeactivate() {
    if (!canManageEmployee) {
      setError('You do not have permission to deactivate employees.');
      return;
    }
    if (
      !confirm(
        'Are you sure you want to deactivate this employee? This will mark them as INACTIVE.',
      )
    ) {
      return;
    }

    const reason =
      prompt('Enter deactivation reason (optional):')?.trim() || undefined;

    try {
      setLoading(true);
      setError(null);
      await api.patch(`/employee-profile/${employee._id}/deactivate`, {
        reason,
      });
      // Reload profile to reflect new status
      const res = await api.get<EmployeeProfile>(
        `/employee-profile/${employee._id}`,
      );
      setEmployee(res.data);
    } catch (err: any) {
      console.error('Failed to deactivate employee', err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to deactivate employee.';
      setError(
        typeof backendMessage === 'string'
          ? backendMessage
          : JSON.stringify(backendMessage),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600 mt-1">
            View and manage employee profile details
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {/* Header Card */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={fullName} size={64} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-gray-600 mt-1">
              Employee #{employee.employeeNumber || '—'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge kind="employee" value={employee.status} />
            {employee.deactivatedAt && (
              <p className="text-xs text-red-600">
                Deactivated on{' '}
                {new Date(employee.deactivatedAt).toLocaleDateString()}
              </p>
            )}
            {canManageEmployee && employee.status !== 'INACTIVE' && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeactivate}
              >
                Deactivate Employee
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card title="Personal Information">
          <dl className="grid grid-cols-1 gap-4">
            <Term label="First Name" value={employee.firstName} />
            <Term label="Last Name" value={employee.lastName} />
            <Term label="National ID" value={employee.nationalId} />
            <Term label="Personal Email" value={employee.personalEmail} />
            <Term label="Mobile Phone" value={employee.mobilePhone} />
            <Term label="Home Phone" value={employee.homePhone} />
            <Term
              label="Date of Birth"
              value={
                employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString()
                  : undefined
              }
            />
            <Term label="Biography" value={employee.biography} long />
            <Term
              label="Address"
              value={
                employee.address
                  ? [
                      employee.address.streetAddress,
                      employee.address.city,
                      employee.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : undefined
              }
              long
            />
          </dl>
        </Card>

        {/* Employment Details */}
        <Card title="Employment Details">
          <dl className="grid grid-cols-1 gap-4">
            <Term label="Employee Number" value={employee.employeeNumber} />
            <Term
              label="Status"
              value={employee.status.replace(/_/g, ' ')}
            />
            <Term
              label="Contract Type"
              value={
                employee.contractType
                  ? employee.contractType.replace(/_/g, ' ')
                  : undefined
              }
            />
            <Term
              label="Date of Hire"
              value={
                employee.dateOfHire
                  ? new Date(employee.dateOfHire).toLocaleDateString()
                  : undefined
              }
            />
            <Term
              label="Department"
              value={employee.primaryDepartmentId ? String(employee.primaryDepartmentId) : '—'}
            />
            <Term
              label="Position"
              value={employee.primaryPositionId ? String(employee.primaryPositionId) : '—'}
            />
            <Term
              label="Pay Grade"
              value={employee.payGradeId ? String(employee.payGradeId) : '—'}
            />
          </dl>

          {hasPermission(user?.role || '', 'canSubmitChangeRequests') && (
            <div className="mt-6">
              <Link href={`/employee-profile/${employee._id}/change-requests/new`}>
                <Button variant="outline" size="sm">
                  Request Profile Change
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Raw JSON Section */}
      <Card title="Raw Document">
        <p className="text-sm text-gray-600 mb-4">
          This is the JSON document exactly as stored in MongoDB (useful for debugging and demo purposes).
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96 text-sm">
          {JSON.stringify(employee, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

function Term({
  label,
  value,
  long,
}: {
  label: string;
  value?: string;
  long?: boolean;
}) {
  return (
    <div className={long ? 'col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className={`text-sm text-gray-900 ${long ? 'whitespace-pre-wrap' : 'truncate'}`}>
        {value || '—'}
      </dd>
    </div>
  );
}