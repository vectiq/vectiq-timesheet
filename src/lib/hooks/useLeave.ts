import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLeave, createLeave, updateLeave, deleteLeave } from '@/lib/services/leave';
import type { Leave } from '@/types';

const QUERY_KEY = 'leave';

export function useLeave() {
  const queryClient = useQueryClient();

  // Query for fetching leave
  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getLeave,
    // Refresh data every 5 minutes since Xero is source of truth
    staleTime: 1000 * 60 * 5,
    // Retry up to 3 times on failure
    retry: 3,
    // Show stale data while revalidating
    keepPreviousData: true
  });

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
    leave: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isRefetching,

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
    deleteError: deleteMutation.error,

    // Refetch function
    refetch: query.refetch
  };
}