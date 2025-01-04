import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  submitTimesheetApproval, 
  withdrawApproval,
  rejectTimesheet,
  getApprovals,
  getApprovalStatus as getApprovalStatusService
} from '@/lib/services/approvals';
import type { Project, Client, TimeEntry, Approval } from '@/types';

const QUERY_KEYS = {
  approvals: 'approvals',
  status: (projectId: string, userId: string, startDate: string, endDate: string) => 
    ['approval-status', projectId, userId, startDate, endDate] as const
} as const;

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
    queryKey: [QUERY_KEYS.approvals],
    queryFn: getApprovals
  });

  const getApprovalStatusQuery = (
    projectId: string,
    userId: string,
    startDate: string,
    endDate: string
  ) => useQuery({
    queryKey: QUERY_KEYS.status(projectId, userId, startDate, endDate),
    queryFn: () => getApprovalStatusService(projectId, userId, startDate, endDate)
  });

  const submitMutation = useMutation({
    mutationFn: (request: ApprovalRequest) => submitTimesheetApproval(request),
    onSuccess: () => {
      // Invalidate all approval-related queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === QUERY_KEYS.approvals ||
          query.queryKey[0] === 'approval-status'
      });
    }
  });
  
  const withdrawMutation = useMutation({
    mutationFn: (approvalId: string) => withdrawApproval(approvalId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === QUERY_KEYS.approvals ||
          query.queryKey[0] === 'approval-status'
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (approval: Approval,) => rejectTimesheet(approval),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === QUERY_KEYS.approvals ||
          query.queryKey[0] === 'approval-status'
      });
    }
  });

  return {
    approvals: query.data || [],
    submitApproval: submitMutation.mutateAsync,
    useApprovalStatus: getApprovalStatusQuery,
    withdrawApproval: withdrawMutation.mutateAsync,
    rejectTimesheet: rejectMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isRejecting: rejectMutation.isPending,
    error: submitMutation.error,
  };
}