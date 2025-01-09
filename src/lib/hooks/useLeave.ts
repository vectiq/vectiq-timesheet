import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getLeave, createLeave, updateLeave, deleteLeave } from '@/lib/services/leave';
import { formatDistanceToNow } from 'date-fns';
import type { Leave } from '@/types';

const QUERY_KEY = 'leave';

export function useLeave() {
  const queryClient = useQueryClient();

  // Query for fetching leave with caching strategy
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => getLeave(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    await queryClient.fetchQuery({ 
      queryKey: [QUERY_KEY],
      queryFn: () => getLeave(true)
    });
  }, [queryClient]);

  const lastRefreshedText = data?.lastRefreshed 
    ? formatDistanceToNow(data.lastRefreshed, { addSuffix: true })
    : 'Never';

  // Create leave mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Leave, 'id' | 'status' | 'xeroLeaveId'>) => createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error creating leave:', error);
      throw error;
    }
  });

  // Update leave mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Leave> }) => updateLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error updating leave:', error);
      throw error;
    }
  });

  // Delete leave mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error deleting leave:', error);
      throw error;
    }
  });

  return {
    // Data and loading states
    leave: data?.leave || [],
    isLoading,
    isError,
    error,
    lastRefreshed: lastRefreshedText,
    refresh,
    isRefreshing: isFetching,

    // Mutations
    createLeave: createMutation.mutateAsync,
    updateLeave: updateMutation.mutateAsync,
    deleteLeave: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
}