'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalAssignment, AppraisalAssignmentStatus, AppraisalRecord } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { isEmployee, isManager, isHRAdmin } from '@/lib/performanceRoles';

export default function RecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [records, setRecords] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    cycleId: '',
    status: '',
  });

  useEffect(() => {
    loadData();
  }, [filters, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Employees: Only fetch their own records using employee-specific endpoint
      if (isEmployee(user?.role)) {
        if (!user?.id) {
          setError('User ID not available');
          return;
        }
        const employeeRecords = await performanceService.getEmployeeRecords(user.id);
        setRecords(employeeRecords);
        setAssignments([]);
        return;
      }
      
      // Managers: Fetch assignments where they are the manager
      if (isManager(user?.role)) {
        const params: any = {};
        if (filters.cycleId) params.cycleId = filters.cycleId;
        if (filters.status) params.status = filters.status as AppraisalAssignmentStatus;
        if (user?.id) {
          params.managerProfileId = user.id;
        }
        const data = await performanceService.getAssignments(params);
        setAssignments(data);
        setRecords([]);
        return;
      }
      
      // HR Admin: Fetch all assignments
      if (isHRAdmin(user?.role)) {
        const params: any = {};
        if (filters.cycleId) params.cycleId = filters.cycleId;
        if (filters.status) params.status = filters.status as AppraisalAssignmentStatus;
        const data = await performanceService.getAssignments(params);
        setAssignments(data);
        setRecords([]);
        return;
      }
      
      // Default fallback
      setAssignments([]);
      setRecords([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading records..." />;
  }

  // Render employee records view
  if (isEmployee(user?.role)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Performance Records</h1>
            <p className="text-gray-600 mt-1">View your performance appraisal records</p>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        {records.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">No performance records found</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <Card
                key={record._id}
                onClick={() => router.push(`/performance/records/${record._id}`)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Performance Record
                      </h3>
                      <PerformanceStatusBadge status={record.status} type="record" />
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Cycle: {record.cycleId}</span>
                      {record.totalScore !== undefined && (
                        <span>Score: {record.totalScore}</span>
                      )}
                      {record.createdAt && <span>Created: {formatDate(record.createdAt)}</span>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/performance/records/${record._id}`);
                    }}
                  >
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render manager/HR admin assignments view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager(user?.role) ? 'Assigned Records' : 'Appraisal Records'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isManager(user?.role) 
              ? 'View and submit evaluations for your team members'
              : 'View and manage appraisal records'}
          </p>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {!isEmployee(user?.role) && (
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            {Object.values(AppraisalAssignmentStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {assignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No assignments found</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment._id}
              onClick={() => {
                if (assignment.latestAppraisalId) {
                  router.push(`/performance/records/${assignment.latestAppraisalId}`);
                } else {
                  router.push(`/performance/records/new?assignmentId=${assignment._id}`);
                }
              }}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assignment ID: {assignment._id}
                    </h3>
                    <PerformanceStatusBadge status={assignment.status} type="assignment" />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Employee: {assignment.employeeProfileId}</span>
                    <span>Manager: {assignment.managerProfileId}</span>
                    {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate)}</span>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (assignment.latestAppraisalId) {
                      router.push(`/performance/records/${assignment.latestAppraisalId}`);
                    } else {
                      router.push(`/performance/records/new?assignmentId=${assignment._id}`);
                    }
                  }}
                >
                  {assignment.latestAppraisalId ? 'View' : 'Create Record'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

