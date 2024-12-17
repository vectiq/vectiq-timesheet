import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Member } from '@/types';
import type { InviteMemberData } from '@/lib/schemas/member';

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'consultant',
    status: 'active',
    joinedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'pending@example.com',
    role: 'consultant',
    status: 'pending',
  },
];

async function fetchMembers(): Promise<Member[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockMembers;
}

async function inviteMember(data: InviteMemberData): Promise<Member> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newMember: Member = {
    id: crypto.randomUUID(),
    email: data.email,
    role: data.role,
    status: 'pending',
  };
  mockMembers.push(newMember);
  return newMember;
}

export function useMembers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    inviteMember: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
}