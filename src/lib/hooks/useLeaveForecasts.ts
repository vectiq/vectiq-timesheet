import { useQuery } from '@tanstack/react-query';
import { getLeave } from '@/lib/services/leave';
import { format, parseISO } from 'date-fns';
import type { Leave } from '@/types';

const QUERY_KEY = 'leave-forecasts';

export function useLeaveForecasts(month: string) {
  const query = useQuery({
    queryKey: [QUERY_KEY, month],
    queryFn: async () => {
      const leaveData = await getLeave();
      
      // Filter leave entries for the selected month
      const monthStart = format(new Date(month + '-01'), 'yyyy-MM-dd');
      const monthEnd = format(new Date(month + '-01').setMonth(new Date(month + '-01').getMonth() + 1), 'yyyy-MM-dd');
      
      const monthlyLeave = leaveData.leave.filter(leave => {
        const startDate = format(parseISO(leave.startDate), 'yyyy-MM-dd');
        const endDate = format(parseISO(leave.endDate), 'yyyy-MM-dd');
        return startDate >= monthStart && endDate <= monthEnd && leave.status === 'SCHEDULED';
      });

      return {
        leave: monthlyLeave,
        leaveBalances: leaveData.leaveBalances
      };
    }
  });

  return {
    leaveData: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
}