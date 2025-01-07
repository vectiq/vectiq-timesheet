import { useQuery } from '@tanstack/react-query';
import { generateDummyForecasts, getWorkingDays, getUserForecasts } from '@/lib/services/forecasting';
import { format } from 'date-fns';
import type { ProjectForecast, WorkingDays, UserForecast } from '@/types/forecasting';

const QUERY_KEYS = {
  forecasts: (month: string) => ['forecasts', month] as const,
  workingDays: (month: string) => ['working-days', month] as const,
  userForecasts: (month: string) => ['user-forecasts', month] as const,
} as const;

interface UseforecastingOptions {
  currentDate?: Date;
  yearType?: 'calendar' | 'financial';
  selectedYear?: number;
}

export function useForecasting({ currentDate, yearType, selectedYear }: UseforecastingOptions = {}) {
  const month = currentDate ? format(currentDate, 'yyyy-MM') : format(new Date(), 'yyyy-MM');
  const year = selectedYear ?? new Date().getFullYear();

  const forecastsQuery = useQuery({
    queryKey: ['forecasts', yearType, year, month],
    queryFn: () => {
      if (yearType && selectedYear) {
        // For yearly report view
        const startMonth = yearType === 'calendar' 
          ? `${year}-01` // January
          : `${year}-07`; // July
        return generateDummyForecasts(startMonth, 12, { yearType, year });
      }
      // For monthly view
      return generateDummyForecasts(month, 6);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const workingDaysQuery = useQuery({
    queryKey: QUERY_KEYS.workingDays(month),
    queryFn: () => getWorkingDays(month),
    enabled: !!currentDate,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const userForecastsQuery = useQuery({
    queryKey: QUERY_KEYS.userForecasts(month),
    queryFn: () => getUserForecasts(month),
    enabled: !!currentDate,
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