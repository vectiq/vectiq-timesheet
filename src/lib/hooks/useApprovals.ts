import { useMutation, useQuery } from '@tanstack/react-query';
import { submitTimesheetApproval } from '@/lib/services/approvals';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'approvals'));
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Approval[];
    }
  });

  const submitMutation = useMutation({
    mutationFn: (request: ApprovalRequest) => submitTimesheetApproval(request),
    onSuccess: () => {
      query.refetch();
    }
  });

  return {
    approvals: query.data || [],
    submitApproval: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    error: submitMutation.error,
  };
}