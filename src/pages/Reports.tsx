import { useState, useCallback } from 'react';
import { ReportTabs } from '@/components/reports/ReportTabs';
import { TimeReport } from '@/components/reports/TimeReport';
import { OvertimeReport } from '@/components/reports/OvertimeReport';
import type { ReportFilters as ReportFiltersType } from '@/types';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('time');
  const [filters, setFilters] = useState<ReportFiltersType>({
    startDate: '',
    endDate: '',
    clientIds: [],
    projectIds: [],
    roleIds: [],
  });

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
      </div>

      <ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'time' ? (
        <TimeReport filters={filters} onFiltersChange={setFilters} />
      ) : (
        <OvertimeReport filters={filters} onFiltersChange={setFilters} />
      )}
    </div>
  );
}