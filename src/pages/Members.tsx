import { useState } from 'react';
import { useMembers } from '@/lib/hooks/useMembers';
import { Button } from '@/components/ui/Button';
import { MembersTable } from '@/components/members/MembersTable';
import { InviteMemberDialog } from '@/components/members/InviteMemberDialog';
import { UserPlus } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Members() {
  const { members, isLoading, inviteMember } = useMembers();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <MembersTable members={members} />

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={inviteMember}
      />
    </div>
  );
}