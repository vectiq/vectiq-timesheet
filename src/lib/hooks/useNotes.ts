import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { format, startOfMonth } from 'date-fns';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '@/lib/services/notes';
import type { Note } from '@/types';

const QUERY_KEY = 'notes';

export function useNotes(projectId: string | null, date: Date) {
  const queryClient = useQueryClient();
  // Ensure consistent month format by using startOfMonth
  const month = format(startOfMonth(date), 'yyyy-MM');
  
  // Create a stable query key
  const queryKey = [QUERY_KEY, projectId, month];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      console.log('Fetching notes for:', { projectId, month });
      return getNotes(projectId, month);
    },
    enabled: !!projectId,
    staleTime: 0 // Always refetch when query is invalidated
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      console.log('Note created, invalidating queries');
      return queryClient.invalidateQueries({
        queryKey: queryKey,
        exact: true 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId, month] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId, month] });
    }
  });

  const handleCreateNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateNote = useCallback(async (id: string, data: Partial<Note>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const handleDeleteNote = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createNote: handleCreateNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}