import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';
import { ReportSummary } from './ReportSummary';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { ReportFilters as ReportFiltersType } from '@/types';

interface TimeReportProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
}

export function TimeReport({ filters, onFiltersChange }: TimeReportProps) {
  const { data, isLoading } = useReports({ ...filters, type: 'time' });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <ReportFilters filters={filters} onChange={onFiltersChange} />
      <ReportSummary data={data?.summary} />
      <ReportTable data={data?.entries} />
    </div>
  );
}