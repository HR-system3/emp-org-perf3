'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { employeesService } from '@/services/api/employees.service';
import { HierarchyNode } from '@/types/employee.types';

export default function MyTeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTeam();
    }
  }, [user]);

  const fetchTeam = async () => {
    if (!user?.id) return;

    try {
      const data = await employeesService.getSubtree(user.id);
      setTeamMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading your team..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
        <p className="text-gray-600 mt-2">View your direct reports and team structure</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {teamMembers.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-medium">No Team Members</p>
            <p className="text-sm mt-2">You don't have any direct reports at this time</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  👤
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-blue-600 mb-1">{member.positionTitle}</p>
                <p className="text-xs text-gray-500 mb-3">{member.departmentName}</p>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                      {member.email}
                    </a>
                  </div>
                </div>

                {member.children && member.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Manages {member.children.length} team member{member.children.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {teamMembers.length > 0 && (
        <div className="mt-8">
          <Card title="Team Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{teamMembers.length}</p>
                <p className="text-sm text-gray-600 mt-1">Direct Reports</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {teamMembers.reduce((acc, m) => acc + (m.children?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Indirect Reports</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(teamMembers.map(m => m.departmentId)).size}
                </p>
                <p className="text-sm text-gray-600 mt-1">Departments</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}