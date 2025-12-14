import { useState, useEffect } from 'react';
import { positionsService } from '@/services/api/positions.service';
import { Position } from '@/types/position.types';

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await positionsService.getAllPositions();
      setPositions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch positions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const refetch = () => {
    fetchPositions();
  };

  return {
    positions,
    isLoading,
    error,
    refetch,
  };
}