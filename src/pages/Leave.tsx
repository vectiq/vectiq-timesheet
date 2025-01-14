import { useState } from 'react';
import { useLeave } from '@/lib/hooks/useLeave';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { LeaveDialog } from '@/components/leave/LeaveDialog';
import { LeaveTable } from '@/components/leave/LeaveTable';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function Leave() {
  const { createLeave, updateLeave, deleteLeave, isCreating, isUpdating, isDeleting } = useLeave();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { confirm, dialog, handleClose } = useConfirm();

  const handleOpenCreateDialog = () => {
    setSelectedLeave(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    if (selectedLeave) {
      await updateLeave({ id: selectedLeave.id, data });
    } else {
      await createLeave(data);
    }
    setIsDialogOpen(false);
  };

  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Leave Request',
      message: 'Are you sure you want to delete this leave request? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteLeave(id);
    }
  };

  const isProcessing = isCreating || isUpdating || isDeleting;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Leave</h1>
        <Button onClick={handleOpenCreateDialog} disabled={isProcessing}>
          {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <Card>
        <LeaveTable
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <LeaveDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        leave={selectedLeave}
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