import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { updateProfile as updateFirebaseProfile, updateEmail, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { getUsers, getCurrentUser, createUser, updateUser, deleteUser, createProjectAssignment, deleteProjectAssignment } from '@/lib/services/users';
import { auth } from '@/lib/firebase';
import type { User, ProjectAssignment } from '@/types';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export function useUsers() {
  const queryClient = useQueryClient();
  const [effectiveUser, setEffectiveUser] = useState<User | null>(null);

  // Only set effective user initially if not already set
  const usersQuery = useQuery({
    queryKey: [USERS_KEY],
    queryFn: getUsers,
    staleTime: 1000 * 60 // 1 minute
  });

  const currentUserQuery = useQuery({
    queryKey: [CURRENT_USER_KEY],
    queryFn: getCurrentUser
  });

  // Reset effective user when current user changes
  useEffect(() => {
    if (!effectiveUser && currentUserQuery.data) {
      setEffectiveUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data]);

  const handleSetEffectiveUser = useCallback((user: User) => {
    if (currentUserQuery.data?.role === 'admin') {
      setEffectiveUser(user);
    }
  }, [currentUserQuery.data?.role]);

  const resetEffectiveUser = useCallback(() => {
    if (currentUserQuery.data) {
      setEffectiveUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data]);

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: Omit<ProjectAssignment, 'id'>) => createProjectAssignment(data.userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: ({ userId, assignmentId }: { userId: string; assignmentId: string }) => 
      deleteProjectAssignment(userId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });

  const handleCreateUser = useCallback(async (data: Omit<User, 'id'>) => {
    return createUserMutation.mutateAsync(data);
  }, [createUserMutation]);

  const handleUpdateUser = useCallback(async (id: string, data: Partial<User>) => {
    const currentUser = auth.currentUser;
    if (currentUser?.uid === id) {
      if (data.name) {
        await updateFirebaseProfile(currentUser, { displayName: data.name });
      }
      if (data.email && data.email !== currentUser.email) {
        await updateEmail(currentUser, data.email);
      }
    }
    return updateUserMutation.mutateAsync({ id, data });
  }, [updateUserMutation]);

  const handleDeleteUser = useCallback(async (id: string) => {
    return deleteUserMutation.mutateAsync(id);
  }, [deleteUserMutation]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  return {
    users: usersQuery.data ?? [],
    currentUser: currentUserQuery.data ?? null,
    effectiveUser: effectiveUser ?? currentUserQuery.data ?? null,
    setEffectiveUser: handleSetEffectiveUser,
    resetEffectiveUser,
    isAdmin: currentUserQuery.data?.role === 'admin',
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    assignToProject: createAssignmentMutation.mutateAsync,
    removeFromProject: deleteAssignmentMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isAssigning: createAssignmentMutation.isPending,
    isRemoving: deleteAssignmentMutation.isPending,
    sendPasswordReset,
  };
}