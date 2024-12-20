import { useState, useCallback } from 'react';
import { useRoles } from '@/lib/hooks/useRoles';
import { RolesTable } from '@/components/roles/RolesTable';
import { RoleDialog } from '@/components/roles/RoleDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Role } from '@/types';

export default function Roles() {
  const { 
    roles, 
    isLoading, 
    createRole, 
    updateRole, 
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting 
  } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { confirm, dialog, handleClose } = useConfirm();

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data: Omit<Role, 'id'>) => {
    if (selectedRole) {
      await updateRole(selectedRole.id, data);
    } else {
      await createRole(data);
    }
    setIsDialogOpen(false);
  }, [selectedRole, updateRole, createRole]);

  const handleEdit = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteRole(id);
    }
  }, [confirm, deleteRole]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isProcessing = isCreating || isUpdating || isDeleting;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
        <Button onClick={handleOpenCreateDialog} disabled={isProcessing}>
          {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          New Role
        </Button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <RolesTable 
          roles={roles} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={selectedRole}
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