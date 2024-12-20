import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import { isWithinInterval, parseISO } from 'date-fns';
import type { TimeEntry } from '@/types';

interface TimeEntryFilters {
  dateRange?: { start: Date; end: Date };
  projectId?: string;
  roleId?: string;
}

export function useTimeEntries(filters?: TimeEntryFilters) {
  const store = useStore();
  const queryClient = useQueryClient();

  // Query for fetching time entries
  const query = useQuery({
    queryKey: ['timeEntries', filters],
    queryFn: () => {
      let entries = store.timeEntries;

      if (filters) {
        entries = entries.filter(entry => {
          // Date range filter
          if (filters.dateRange) {
            const entryDate = parseISO(entry.date);
            if (!isWithinInterval(entryDate, filters.dateRange)) {
              return false;
            }
          }

          // Project filter
          if (filters.projectId && entry.projectId !== filters.projectId) {
            return false;
          }

          // Role filter
          if (filters.roleId && entry.roleId !== filters.roleId) {
            return false;
          }

          return true;
        });
      }

      return entries.sort((a, b) => b.date.localeCompare(a.date));
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (entry: Omit<TimeEntry, 'id'>) => {
      const newEntry = { ...entry, id: `entry_${Date.now()}` };
      store.addTimeEntry(newEntry);
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (entry: TimeEntry) => {
      store.updateTimeEntry(entry.id, entry);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      store.deleteTimeEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  return {
    timeEntries: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createTimeEntry: createMutation.mutate,
    updateTimeEntry: updateMutation.mutate,
    deleteTimeEntry: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}