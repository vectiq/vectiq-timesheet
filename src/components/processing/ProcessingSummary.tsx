import { Card } from '@/components/ui/Card';
import { Clock, FileText, Bell, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { format } from 'date-fns';
import { NotesSlideout } from './NotesSlideout';
import { useProcessingNotes } from '@/lib/hooks/useProcessingNotes';
import type { ProcessingData } from '@/types';

interface ProcessingSummaryProps {
  data: ProcessingData;
  month: string;
}

export function ProcessingSummary({ data, month }: ProcessingSummaryProps) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  const {
    monthlyNotes,
    addMonthlyNote,
    updateMonthlyNote,
    deleteMonthlyNote,
    isLoadingMonthlyNotes
  } = useProcessingNotes({ month });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="h-6 w-6 text-green-600" />
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

      <Card className="p-4">
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

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <Button 
            variant="secondary" 
            className="w-full flex items-center group hover:bg-gray-50"
            onClick={() => setIsNotesOpen(true)}
          >
            <StickyNote className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Monthly Notes
            <Badge variant="secondary" className="ml-auto">
              {monthlyNotes.length}
            </Badge>
          </Button>
        </div>
      </Card>

      <NotesSlideout
        open={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        title="Monthly Processing Notes"
        notes={monthlyNotes}
        onAddNote={addMonthlyNote}
        onUpdateNote={updateMonthlyNote}
        onDeleteNote={deleteMonthlyNote}
        isLoading={isLoadingMonthlyNotes}
      />
    </div>
  );
}