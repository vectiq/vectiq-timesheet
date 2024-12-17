import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTimeEntries, createTimeEntry } from '@/lib/api/timeEntries';
import type { TimeEntry } from '@/types';

export function useTimeEntries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['time-entries'],
    queryFn: fetchTimeEntries,
  });

  const createMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  return {
    timeEntries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTimeEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}