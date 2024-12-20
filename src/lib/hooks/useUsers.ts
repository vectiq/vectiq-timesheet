import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProjectAssignments,
  createProjectAssignment,
  deleteProjectAssignment
} from '@/lib/services/users';
import type { User, ProjectAssignment } from '@/types';

const USERS_KEY = 'users';
const ASSIGNMENTS_KEY = 'projectAssignments';

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: [USERS_KEY],
    queryFn: getUsers
  });

  const assignmentsQuery = useQuery({
    queryKey: [ASSIGNMENTS_KEY],
    queryFn: getProjectAssignments
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: createProjectAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteProjectAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] });
    }
  });

  const handleCreateUser = useCallback(async (data: Omit<User, 'id'>) => {
    return createUserMutation.mutateAsync(data);
  }, [createUserMutation]);

  const handleUpdateUser = useCallback(async (id: string, data: Partial<User>) => {
    return updateUserMutation.mutateAsync(id, data);
  }, [updateUserMutation]);

  const handleDeleteUser = useCallback(async (id: string) => {
    return deleteUserMutation.mutateAsync(id);
  }, [deleteUserMutation]);

  const handleCreateAssignment = useCallback(async (data: Omit<ProjectAssignment, 'id'>) => {
    return createAssignmentMutation.mutateAsync(data);
  }, [createAssignmentMutation]);

  const handleDeleteAssignment = useCallback(async (id: string) => {
    return deleteAssignmentMutation.mutateAsync(id);
  }, [deleteAssignmentMutation]);

  return {
    users: usersQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    isLoading: usersQuery.isLoading || assignmentsQuery.isLoading,
    error: usersQuery.error || assignmentsQuery.error,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    assignToProject: handleCreateAssignment,
    removeFromProject: handleDeleteAssignment,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isAssigning: createAssignmentMutation.isPending,
    isRemoving: deleteAssignmentMutation.isPending,
  };
}