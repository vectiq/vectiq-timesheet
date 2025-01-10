import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { UsersTable } from '@/components/users/UsersTable';
import { UserDialog } from '@/components/users/UserDialog';
import { ProjectAssignmentDialog } from '@/components/users/ProjectAssignmentDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { User, ProjectAssignment } from '@/types';

export default function Users() {
  const { 
    users, 
    isLoading, 
    createUser, 
    updateUser, 
    deleteUser,
    assignToProject,
    removeFromProject,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

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
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };

  const handleAssignProject = (user: User) => {
    setSelectedUser(user);
    setIsAssignmentDialogOpen(true);
  };

  const handleProjectAssignment = async (data: Omit<ProjectAssignment, 'id'>) => {
    await assignToProject(data);
    setIsAssignmentDialogOpen(false);
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
          onAssignProject={handleAssignProject}
          onRemoveAssignment={(userId, assignmentId) => removeFromProject({ userId, assignmentId })}
        />
      </div>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      {selectedUser && (
        <ProjectAssignmentDialog
          open={isAssignmentDialogOpen}
          onOpenChange={setIsAssignmentDialogOpen}
          user={selectedUser}
          onSubmit={handleProjectAssignment}
        />
      )}
    </div>
  );
}