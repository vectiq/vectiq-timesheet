import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  getApprovalsForDate,
  submitTimesheetApproval, 
  withdrawApproval,
  rejectTimesheet,
  getApprovals,
  getApprovalStatus
} from '@/lib/services/approvals';
import { useProjects } from './useProjects';
import { useUsers } from './useUsers';
import type { Project, Client, TimeEntry, Approval } from '@/types';

const QUERY_KEYS = {
  approvals: 'approvals',
  status: (projectId: string, userId: string, startDate: string, endDate: string) =>
    ['approval-status', projectId, userId, startDate, endDate] as const,
  dateApprovals: (date: string, userId: string, projectId: string) =>
    ['approvals-for-date', date, userId, projectId] as const
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
  const { effectiveUser } = useUsers();
  const { projects } = useProjects();

  // Check if user is assigned to project task
  const isUserAssignedToProject = useCallback((userId: string, projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    if (!project) return false;
    
    return project.tasks.some(task => 
      task.userAssignments?.some(a => a.userId === userId)
    );
  }, [projects]);

  const approvalsQuery = useQuery({
    queryKey: [QUERY_KEYS.approvals],
    queryFn: getApprovals
  });

  const getApprovalStatusQuery = (
    projectId: string,
    userId: string | undefined,
    startDate: string,
    endDate: string
  ) => useQuery({
    queryKey: QUERY_KEYS.status(projectId, userId, startDate, endDate),
    queryFn: () => getApprovalStatus(projectId, userId || effectiveUser?.id || '', startDate, endDate),
    enabled: !!projectId && (!!userId || !!effectiveUser) && isUserAssignedToProject(userId || effectiveUser?.id || '', projectId)
  });

  const useApprovalsForDate = (date: string, userId: string | undefined, projectId: string) => useQuery({
    queryKey: QUERY_KEYS.dateApprovals(date, userId, projectId),
    queryFn: () => getApprovalsForDate(date, userId || effectiveUser?.id || '', projectId),
    enabled: !!projectId && (!!userId || !!effectiveUser)
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
    useApprovalStatus: getApprovalStatusQuery,
    useApprovalsForDate,
    withdrawApproval: withdrawMutation.mutateAsync,
    rejectTimesheet: rejectMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isRejecting: rejectMutation.isPending,
    error: submitMutation.error
  };
}