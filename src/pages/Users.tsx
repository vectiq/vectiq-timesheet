import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { UsersTable } from '@/components/users/UsersTable';
import { UserDialog } from '@/components/users/UserDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { User } from '@/types';

export default function Users() {
  const { 
    users, 
    isLoading, 
    createUser, 
    updateUser, 
    deleteUser,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const { confirm, dialog, handleClose } = useConfirm();

  const handleOpenCreateDialog = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<User, 'id'>) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data);
    }
    setIsUserDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteUser(id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <UsersTable 
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      {dialog && (
        <ConfirmDialog
          open={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </div>
  );
}