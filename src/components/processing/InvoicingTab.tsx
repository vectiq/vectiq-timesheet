import { Card } from '@/components/ui/Card';
import { ProcessingFilters } from './ProcessingFilters';
import { ProcessingTable } from './ProcessingTable';
import type { ProcessingProject } from '@/types';

interface InvoicingTabProps {
  projects: ProcessingProject[];
  onUpdateStatus: (args: { projectId: string; status: 'not started' | 'draft' | 'sent' }) => Promise<void>;
  onFilterChange: (filters: any) => void;
  isUpdating: boolean;
  month: string;
}

export function InvoicingTab({
  projects,
  onUpdateStatus,
  onFilterChange,
  isUpdating,
  month
}: InvoicingTabProps) {
  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <ProcessingFilters onFilterChange={onFilterChange} />
      </div>
      <ProcessingTable 
        projects={projects}
        onUpdateStatus={onUpdateStatus}
        isUpdating={isUpdating}
        month={month}
      />
    </Card>
  );
}