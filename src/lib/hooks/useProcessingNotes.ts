import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getProjectNotes,
  getMonthlyNotes,
  addProjectNote,
  addMonthlyNote,
  updateProjectNote,
  updateMonthlyNote,
  deleteProjectNote,
  deleteMonthlyNote
} from '@/lib/services/processingNotes';
import type { Note } from '@/types';

const QUERY_KEYS = {
  projectNotes: 'project-notes',
  monthlyNotes: 'monthly-notes'
} as const;

interface UseProcessingNotesOptions {
  projectId?: string;
  month: string;
}

export function useProcessingNotes({ projectId, month }: UseProcessingNotesOptions) {
  const queryClient = useQueryClient();

  // Query for project notes
  const projectNotesQuery = useQuery({
    queryKey: [QUERY_KEYS.projectNotes, projectId, month],
    queryFn: () => getProjectNotes(projectId!, month),
    enabled: !!projectId && !!month
  });

  // Query for monthly notes
  const monthlyNotesQuery = useQuery({
    queryKey: [QUERY_KEYS.monthlyNotes, month],
    queryFn: () => getMonthlyNotes(month),
    enabled: !!month
  });

  // Add project note mutation
  const addProjectNoteMutation = useMutation({
    mutationFn: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
      addProjectNote(projectId!, month, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.projectNotes, projectId, month]
      });
    }
  });

  // Add monthly note mutation
  const addMonthlyNoteMutation = useMutation({
    mutationFn: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
      addMonthlyNote(month, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.monthlyNotes, month]
      });
    }
  });

  // Update project note mutation
  const updateProjectNoteMutation = useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: Partial<Note> }) =>
      updateProjectNote(projectId!, month, noteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.projectNotes, projectId, month]
      });
    }
  });

  // Update monthly note mutation
  const updateMonthlyNoteMutation = useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: Partial<Note> }) =>
      updateMonthlyNote(month, noteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.monthlyNotes, month]
      });
    }
  });

  // Delete project note mutation
  const deleteProjectNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      deleteProjectNote(projectId!, month, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.projectNotes, projectId, month]
      });
    }
  });

  // Delete monthly note mutation
  const deleteMonthlyNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      deleteMonthlyNote(month, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.monthlyNotes, month]
      });
    }
  });

  // Callback handlers
  const handleAddProjectNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addProjectNoteMutation.mutateAsync(note);
  }, [addProjectNoteMutation]);

  const handleAddMonthlyNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addMonthlyNoteMutation.mutateAsync(note);
  }, [addMonthlyNoteMutation]);

  const handleUpdateProjectNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    return updateProjectNoteMutation.mutateAsync({ noteId, updates });
  }, [updateProjectNoteMutation]);

  const handleUpdateMonthlyNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    return updateMonthlyNoteMutation.mutateAsync({ noteId, updates });
  }, [updateMonthlyNoteMutation]);

  const handleDeleteProjectNote = useCallback(async (noteId: string) => {
    return deleteProjectNoteMutation.mutateAsync(noteId);
  }, [deleteProjectNoteMutation]);

  const handleDeleteMonthlyNote = useCallback(async (noteId: string) => {
    return deleteMonthlyNoteMutation.mutateAsync(noteId);
  }, [deleteMonthlyNoteMutation]);

  return {
    // Project notes
    projectNotes: projectNotesQuery.data?.notes || [],
    isLoadingProjectNotes: projectNotesQuery.isLoading,
    addProjectNote: handleAddProjectNote,
    updateProjectNote: handleUpdateProjectNote,
    deleteProjectNote: handleDeleteProjectNote,
    isAddingProjectNote: addProjectNoteMutation.isPending,
    isUpdatingProjectNote: updateProjectNoteMutation.isPending,
    isDeletingProjectNote: deleteProjectNoteMutation.isPending,

    // Monthly notes
    monthlyNotes: monthlyNotesQuery.data?.notes || [],
    isLoadingMonthlyNotes: monthlyNotesQuery.isLoading,
    addMonthlyNote: handleAddMonthlyNote,
    updateMonthlyNote: handleUpdateMonthlyNote,
    deleteMonthlyNote: handleDeleteMonthlyNote,
    isAddingMonthlyNote: addMonthlyNoteMutation.isPending,
    isUpdatingMonthlyNote: updateMonthlyNoteMutation.isPending,
    isDeletingMonthlyNote: deleteMonthlyNoteMutation.isPending,
  };
}