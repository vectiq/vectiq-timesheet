import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitTimesheetApproval, withdrawApproval, getApprovalStatus } from '@/lib/services/approvals';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Client, TimeEntry, Approval, ApprovalStatus } from '@/types';

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
    queryFn: async () => {
      const snapshot = await getDocs(
        query(
          collection(db, 'approvals'),
          orderBy('submittedAt', 'desc')
        )
      );
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Approval[];
    }
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
    getApprovalStatus: async (projectId: string, userId: string, date: string) => {
      return getApprovalStatus(projectId, userId, date);
    },
    withdrawApproval: withdrawMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    error: submitMutation.error,
  };
}