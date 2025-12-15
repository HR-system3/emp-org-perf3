'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { CycleProgress, AppraisalCycle } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CycleProgressPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cycle, setCycle] = useState<AppraisalCycle | null>(null);
  const [progress, setProgress] = useState<CycleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cycleData, progressData] = await Promise.all([
        performanceService.getCycle(id),
        performanceService.getCycleProgress(id),
      ]);
      setCycle(cycleData);
      setProgress(progressData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading progress..." />;
  }

  if (error || !progress) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error || 'Progress data not found'} />
        <Button onClick={() => router.push('/performance/cycles')}>
          Back to Cycles
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Assignments', value: progress.totalAssignments, color: 'bg-blue-500' },
    { label: 'Not Started', value: progress.notStarted, color: 'bg-gray-500' },
    { label: 'In Progress', value: progress.inProgress, color: 'bg-yellow-500' },
    { label: 'Submitted', value: progress.submitted, color: 'bg-blue-600' },
    { label: 'Published', value: progress.published, color: 'bg-green-500' },
    { label: 'Acknowledged', value: progress.acknowledged, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cycle Progress: {cycle?.name || 'Loading...'}
          </h1>
          <p className="text-gray-600 mt-1">Track appraisal cycle completion</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/performance/cycles/${id}`)}>
          Back to Cycle
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Completion Overview">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
              <span className="text-lg font-bold text-gray-900">{progress.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress.completionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Status Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Not Started</span>
                  <span className="text-sm font-medium">{progress.notStarted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium">{progress.inProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted</span>
                  <span className="text-sm font-medium">{progress.submitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="text-sm font-medium">{progress.published}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Acknowledged</span>
                  <span className="text-sm font-medium">{progress.acknowledged}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

