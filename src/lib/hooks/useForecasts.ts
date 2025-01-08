import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { subMonths, format } from 'date-fns';
import {
  getForecastEntries,
  saveForecastEntry,
  updateForecastEntry,
} from '@/lib/services/forecasts';
import type { ForecastEntry } from '@/types';

const QUERY_KEY = 'forecasts';

export function useForecasts(month: string, includePrevious = false) {
  const queryClient = useQueryClient();
  const previousMonth = format(subMonths(new Date(month + '-01'), 1), 'yyyy-MM');

  const currentMonthQuery = useQuery({
    queryKey: [QUERY_KEY, month],
    queryFn: () => getForecastEntries(month)
  });

  const previousMonthQuery = useQuery({
    queryKey: [QUERY_KEY, previousMonth],
    queryFn: () => getForecastEntries(previousMonth),
    enabled: includePrevious
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
    forecasts: currentMonthQuery.data ?? [],
    previousForecasts: previousMonthQuery.data ?? [],
    isLoading: currentMonthQuery.isLoading || (includePrevious && previousMonthQuery.isLoading),
    error: currentMonthQuery.error || previousMonthQuery.error,
    createForecast: handleCreateForecast,
    updateForecast: handleUpdateForecast,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}