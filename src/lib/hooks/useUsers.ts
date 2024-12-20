import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const assignmentsQuery = useQuery({
    queryKey: ['projectAssignments'],
    queryFn: getProjectAssignments
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['projectAssignments'] });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: createProjectAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssignments'] });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteProjectAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssignments'] });
    }
  });

  return {
    users: usersQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    isLoading: usersQuery.isLoading || assignmentsQuery.isLoading,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    assignToProject: createAssignmentMutation.mutate,
    removeFromProject: deleteAssignmentMutation.mutate,
  };
}