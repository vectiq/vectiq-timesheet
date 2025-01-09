import { Card } from '@/components/ui/Card';
import { FileCheck, FileText, DollarSign, Bell, StickyNote, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ProcessingData } from '@/types';

interface ProcessingSummaryProps {
  data: ProcessingData;
}

export function ProcessingSummary({ data }: ProcessingSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileCheck className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Timesheets</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.summary.approvedTimesheets}/{data.summary.totalProjects}
            </p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Invoices</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.summary.generatedInvoices}/{data.summary.totalProjects}
            </p>
            <p className="text-sm text-gray-500">Generated</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Payroll</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.summary.processedPayroll}/{data.summary.totalProjects}
            </p>
            <p className="text-sm text-gray-500">Processed</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <Button variant="secondary" className="w-full justify-start">
            <Bell className="h-4 w-4 mr-2" />
            Reminders
            <Badge variant="warning" className="ml-auto">3</Badge>
          </Button>

          <Button variant="secondary" className="w-full justify-start">
            <StickyNote className="h-4 w-4 mr-2" />
            Notes
          </Button>
        </div>
      </Card>
    </div>
  );
}