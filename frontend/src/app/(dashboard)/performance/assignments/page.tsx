'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/services/api/performance.service';
import { BulkAssignAppraisalsDto, BulkAssignmentItem, AppraisalCycle, AppraisalTemplate } from '@/types/performance.types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { isHRAdmin } from '@/lib/performanceRoles';

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [formData, setFormData] = useState<BulkAssignAppraisalsDto>({
    cycleId: '',
    templateId: '',
    assignments: [],
  });

  const [newAssignment, setNewAssignment] = useState<BulkAssignmentItem>({
    employeeProfileId: '',
    managerProfileId: '',
    departmentId: '',
    positionId: '',
    dueDate: '',
  });

  useEffect(() => {
    loadCyclesAndTemplates();
  }, []);

  const loadCyclesAndTemplates = async () => {
    try {
      const [cyclesData, templatesData] = await Promise.all([
        performanceService.getCycles(),
        performanceService.getTemplates(),
      ]);
      setCycles(cyclesData);
      setTemplates(templatesData);
    } catch (err: any) {
      setError('Failed to load cycles and templates');
    }
  };

  const addAssignment = () => {
    if (!newAssignment.employeeProfileId || !newAssignment.managerProfileId || !newAssignment.departmentId) {
      setError('Employee ID, Manager ID, and Department ID are required');
      return;
    }
    setFormData({
      ...formData,
      assignments: [...formData.assignments, { ...newAssignment }],
    });
    setNewAssignment({
      employeeProfileId: '',
      managerProfileId: '',
      departmentId: '',
      positionId: '',
      dueDate: '',
    });
    setError(null);
  };

  const removeAssignment = (index: number) => {
    setFormData({
      ...formData,
      assignments: formData.assignments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cycleId || !formData.templateId) {
      setError('Cycle and Template are required');
      return;
    }
    if (formData.assignments.length === 0) {
      setError('Please add at least one assignment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await performanceService.bulkAssign(formData);
      setSuccess(`Successfully created ${result.created} assignments`);
      setFormData({
        cycleId: '',
        templateId: '',
        assignments: [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Assign Appraisals</h1>
          <p className="text-gray-600 mt-1">Assign appraisal templates to employees in bulk</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {!isHRAdmin(user?.role) ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Only HR Admins can access bulk assignments.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cycle *
                </label>
                <select
                  required
                  value={formData.cycleId}
                  onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a cycle</option>
                  {cycles.map((cycle) => (
                    <option key={cycle._id} value={cycle._id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                <select
                  required
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assignments ({formData.assignments.length})
              </h3>

              {formData.assignments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                        <span className="font-medium">Employee: {assignment.employeeProfileId}</span>
                        <span>Manager: {assignment.managerProfileId}</span>
                        <span>Dept: {assignment.departmentId}</span>
                        {assignment.dueDate && <span>Due: {assignment.dueDate}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Add New Assignment</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Profile ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAssignment.employeeProfileId}
                      onChange={(e) => setNewAssignment({ ...newAssignment, employeeProfileId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Employee ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager Profile ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAssignment.managerProfileId}
                      onChange={(e) => setNewAssignment({ ...newAssignment, managerProfileId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Manager ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAssignment.departmentId}
                      onChange={(e) => setNewAssignment({ ...newAssignment, departmentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Department ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position ID
                    </label>
                    <input
                      type="text"
                      value={newAssignment.positionId}
                      onChange={(e) => setNewAssignment({ ...newAssignment, positionId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Position ID (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={addAssignment}>
                  Add Assignment
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={loading}>
                Create Assignments
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </form>
      )}
    </div>
  );
}

