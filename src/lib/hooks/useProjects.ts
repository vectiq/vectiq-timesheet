import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/services/projects';
import type { Project } from '@/types';

const QUERY_KEY = 'projects';

export function useProjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getProjects
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateProject = useCallback(async (data: Omit<Project, 'id'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateProject = useCallback(async (data: Project) => {
    if (!data.id) throw new Error('Project ID is required for update');
    return updateMutation.mutateAsync(data.id, data);
  }, [updateMutation]);

  const handleDeleteProject = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}