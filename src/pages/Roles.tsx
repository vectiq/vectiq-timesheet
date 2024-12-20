import { useState } from 'react';
import { useRoles } from '@/lib/hooks/useRoles';
import { RolesTable } from '@/components/roles/RolesTable';
import { RoleDialog } from '@/components/roles/RoleDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Role } from '@/types';

export default function Roles() {
  const { roles, isLoading, createRole, updateRole, deleteRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      await deleteRole(id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
        <Button onClick={handleCreate}>
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
        onSubmit={selectedRole ? updateRole : createRole}
      />
    </div>
  );
}