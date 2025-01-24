import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getPublicHolidays,
  addPublicHoliday,
  deletePublicHoliday,
  importXeroHolidays
} from '@/lib/services/publicHolidays';
import type { PublicHoliday } from '@/types';

const QUERY_KEY = 'public-holidays';

export function usePublicHolidays() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getPublicHolidays
  });

  const addMutation = useMutation({
    mutationFn: addPublicHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePublicHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const importMutation = useMutation({
    mutationFn: ({ holidays, groupId }: { holidays: any[]; groupId: number }) => 
      importXeroHolidays(holidays, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleAddHoliday = useCallback(async (data: Omit<PublicHoliday, 'id'>) => {
    return addMutation.mutateAsync(data);
  }, [addMutation]);

  const handleDeleteHoliday = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const handleImportHolidays = useCallback(async (holidays: any[], groupId: number) => {
    return importMutation.mutateAsync({ holidays, groupId });
  }, [importMutation]);

  return {
    holidays: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addHoliday: handleAddHoliday,
    deleteHoliday: handleDeleteHoliday,
    importHolidays: handleImportHolidays,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending
  };
}