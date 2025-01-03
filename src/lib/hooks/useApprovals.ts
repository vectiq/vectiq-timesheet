import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  submitTimesheetApproval, 
  withdrawApproval,
  getApprovals,
  getApprovalStatus as getApprovalStatusService
} from '@/lib/services/approvals';
import type { Project, Client, TimeEntry, Approval } from '@/types';

const QUERY_KEY = 'approvals';

interface ApprovalRequest {
  project: Project;
  client: Client;
  dateRange: {
    start: Date;
    end: Date;
  };
  entries: TimeEntry[];
  userId: string;
}

export function useApprovals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getApprovals
  });

  const submitMutation = useMutation({
    mutationFn: (request: ApprovalRequest) => submitTimesheetApproval(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
  
  const withdrawMutation = useMutation({
    mutationFn: (approvalId: string) => withdrawApproval(approvalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  return {
    approvals: query.data || [],
    submitApproval: submitMutation.mutateAsync,
    getApprovalStatus: getApprovalStatusService,
    withdrawApproval: withdrawMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    error: submitMutation.error,
  };
}