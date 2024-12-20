import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/lib/services/timeEntries';
import type { TimeEntry } from '@/types';

const QUERY_KEY = 'timeEntries';

interface UseTimeEntriesOptions {
  userId?: string;
}

export function useTimeEntries(options: UseTimeEntriesOptions = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, options.userId],
    queryFn: () => getTimeEntries(options.userId)
  });

  const createMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateEntry = useCallback(async (data: Omit<TimeEntry, 'id'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateEntry = useCallback(async (id: string, data: Partial<TimeEntry>) => {
    return updateMutation.mutateAsync(id, data);
  }, [updateMutation]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    timeEntries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTimeEntry: handleCreateEntry,
    updateTimeEntry: handleUpdateEntry,
    deleteTimeEntry: handleDeleteEntry,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}