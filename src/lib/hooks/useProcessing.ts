import { useQuery } from '@tanstack/react-query';
import { getProcessingData } from '@/lib/services/processing';
import { format } from 'date-fns';

export function useProcessing(date: Date) {
  const month = format(date, 'yyyy-MM');
  
  return useQuery({
    queryKey: ['processing', month],
    queryFn: () => getProcessingData(month)
  });
}