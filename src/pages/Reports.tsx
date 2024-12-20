import { useState } from 'react';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportTable } from '@/components/reports/ReportTable';
import { ReportSummary } from '@/components/reports/ReportSummary';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { ReportFilters as ReportFiltersType } from '@/types';

export default function Reports() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    startDate: '',
    endDate: '',
    clientIds: [],
    projectIds: [],
    roleIds: [],
  });

  const { data, isLoading } = useReports(filters);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} />
      <ReportSummary data={data?.summary} />
      <ReportTable data={data?.entries} />
    </div>
  );
}