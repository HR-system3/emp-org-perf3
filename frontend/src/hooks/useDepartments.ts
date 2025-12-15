import { useState, useEffect } from 'react';
import { Department } from '@/types/department.types';
import { departmentsService } from '@/services/api/departments.service';

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await departmentsService.getAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const refetch = () => {
    fetchDepartments();
  };

  return {
    departments,
    isLoading,
    error,
    refetch,
  };
}