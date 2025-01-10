import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, AlertCircle } from 'lucide-react';

export function ProcessingNotes() {
  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Processing Notes</h3>
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-1">
              <AlertCircle className="h-4 w-4" />
              Special Handling Required
            </div>
            <p className="text-sm text-yellow-700">
              Acme Corp requires detailed timesheet exports for all invoices
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700">
              Send invoices to billing@client.com instead of default contact
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Automated Reminders</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Timesheet Approval</span>
            <Badge variant="warning">Due Today</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Invoice Generation</span>
            <Badge variant="warning">Tomorrow</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Payroll Processing</span>
            <Badge>Next Week</Badge>
          </div>
        </div>
      </Card>
    </>
  );
}