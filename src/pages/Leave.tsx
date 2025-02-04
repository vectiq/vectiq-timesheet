import { useState } from 'react';
import { useLeave } from '@/lib/hooks/useLeave';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Clock } from 'lucide-react';
import { LeaveTable } from '@/components/leave/LeaveTable';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function Leave() {
  const { leave, leaveBalances, deleteLeave, isDeleting } = useLeave();
  const { confirm, dialog, handleClose } = useConfirm();
  
  const handleRequestLeave = () => {
    window.open(import.meta.env.VITE_XERO_LEAVE_URL, '_blank');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Leave</h1>
        <Button onClick={handleRequestLeave}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveBalances.map((balance, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{balance.leaveName}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    {balance.numberOfUnits}
                  </span>
                  <span className="text-sm text-gray-500">
                    {balance.typeOfUnits === 'Hours' ? 'hours' : 'days'} available
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <LeaveTable
          onDelete={handleDelete}
        />
      </Card>


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