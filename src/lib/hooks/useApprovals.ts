import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  submitTimesheetApproval, 
  withdrawApproval,
  rejectTimesheet,
  getApprovals,
} from '@/lib/services/approvals';
import type { Approval, ApprovalRequest } from '@/types';
import { useEffectiveTimesheetUser } from '@/lib/contexts/EffectiveTimesheetUserContext';


const QUERY_KEYS = {
  approvals: 'approvals'
} as const;

export function useApprovals() {
  const queryClient = useQueryClient();
  const { effectiveTimesheetUser } = useEffectiveTimesheetUser();

  const approvalsQuery = useQuery({
    queryKey: [QUERY_KEYS.approvals],
    queryFn: ()=>getApprovals(effectiveTimesheetUser?.id)
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
    approvals: approvalsQuery.data || [],
    submitApproval: submitMutation.mutateAsync,
    withdrawApproval: withdrawMutation.mutateAsync,
    rejectTimesheet: rejectMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isRejecting: rejectMutation.isPending,
    error: submitMutation.error
  };
}