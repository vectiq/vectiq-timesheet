import { useQuery } from '@tanstack/react-query';
import { generateDummyForecasts, getWorkingDays, getUserForecasts } from '@/lib/services/forecasting';
import { format } from 'date-fns';
import type { ProjectForecast, WorkingDays, UserForecast } from '@/types/forecasting';

const QUERY_KEYS = {
  forecasts: (month: string) => ['forecasts', month] as const,
  workingDays: (month: string) => ['working-days', month] as const,
  userForecasts: (month: string) => ['user-forecasts', month] as const,
} as const;

export function useForecasting(currentDate: Date) {
  const month = format(currentDate, 'yyyy-MM');

  const forecastsQuery = useQuery({
    queryKey: QUERY_KEYS.forecasts(month),
    queryFn: () => generateDummyForecasts(month, 6),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const workingDaysQuery = useQuery({
    queryKey: QUERY_KEYS.workingDays(month),
    queryFn: () => getWorkingDays(month),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const userForecastsQuery = useQuery({
    queryKey: QUERY_KEYS.userForecasts(month),
    queryFn: () => getUserForecasts(month),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    forecasts: forecastsQuery.data || [],
    workingDays: workingDaysQuery.data,
    userForecasts: userForecastsQuery.data || [],
    isLoading: forecastsQuery.isLoading || workingDaysQuery.isLoading || userForecastsQuery.isLoading,
    error: forecastsQuery.error || workingDaysQuery.error || userForecastsQuery.error,
  };
}