import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '@/lib/services/roles';
import type { Role } from '@/types';

const QUERY_KEY = 'roles';

export function useRoles() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getRoles
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateRole = useCallback(async (data: Omit<Role, 'id'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateRole = useCallback(async (id: string, data: Partial<Role>) => {
    return updateMutation.mutateAsync(id, data);
  }, [updateMutation]);

  const handleDeleteRole = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    roles: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createRole: handleCreateRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}