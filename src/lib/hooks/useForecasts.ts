import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getForecastEntries,
  saveForecastEntry,
  updateForecastEntry,
} from '@/lib/services/forecasts';
import type { ForecastEntry } from '@/types';

const QUERY_KEY = 'forecasts';

export function useForecasts(month: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, month],
    queryFn: () => getForecastEntries(month)
  });

  const createMutation = useMutation({
    mutationFn: saveForecastEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, month] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) => 
      updateForecastEntry(id, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, month] });
    }
  });

  const handleCreateForecast = useCallback(async (data: Omit<ForecastEntry, 'id'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateForecast = useCallback(async (id: string, hours: number) => {
    return updateMutation.mutateAsync({ id, hours });
  }, [updateMutation]);

  return {
    forecasts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createForecast: handleCreateForecast,
    updateForecast: handleUpdateForecast,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}