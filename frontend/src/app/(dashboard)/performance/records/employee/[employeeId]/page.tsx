'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { AppraisalRecord } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import PerformanceStatusBadge from '@/components/performance/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function EmployeeRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;
  const [records, setRecords] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, [employeeId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceService.getEmployeeRecords(employeeId);
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appraisal Records</h1>
          <p className="text-gray-600 mt-1">View your performance appraisal history</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {records.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No appraisal records found</p>
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
                      Appraisal Record
                    </h3>
                    <PerformanceStatusBadge status={record.status} type="record" />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    {record.totalScore && (
                      <span>Total Score: <strong>{record.totalScore.toFixed(2)}</strong></span>
                    )}
                    {record.overallRatingLabel && (
                      <span>Rating: <strong>{record.overallRatingLabel}</strong></span>
                    )}
                    {record.hrPublishedAt && (
                      <span>Published: {formatDate(record.hrPublishedAt)}</span>
                    )}
                    {record.employeeAcknowledgedAt && (
                      <span className="text-green-600">Acknowledged: {formatDate(record.employeeAcknowledgedAt)}</span>
                    )}
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

