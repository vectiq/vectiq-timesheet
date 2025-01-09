import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProcessingData } from '@/lib/services/processing';
import { updateProjectStatus } from '@/lib/services/processing';
import { format } from 'date-fns';
import type { ProcessingProject } from '@/types';

const PROCESSING_KEY = 'processing';

export function useProcessing(date: Date) {
  const queryClient = useQueryClient();
  const month = format(date, 'yyyy-MM');
  
  const query = useQuery({
    queryKey: [PROCESSING_KEY, month],
    queryFn: () => getProcessingData(month)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string, status: 'not started' | 'draft' | 'sent' }) =>
      updateProjectStatus(projectId, month, status),
    onMutate: async ({ projectId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [PROCESSING_KEY, month] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([PROCESSING_KEY, month]);

      // Optimistically update the cache
      queryClient.setQueryData([PROCESSING_KEY, month], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.map((project: ProcessingProject) =>
            project.id === projectId
              ? { ...project, invoiceStatus: status }
              : project
          )
        };
      });

      // Return context with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousData) {
        queryClient.setQueryData([PROCESSING_KEY, month], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSING_KEY, month] });
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending
  };
}