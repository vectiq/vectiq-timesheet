import { useState } from 'react';
import { format } from 'date-fns';
import { ProcessingSummary } from '@/components/processing/ProcessingSummary';
import { ProcessingTabs } from '@/components/processing/ProcessingTabs';
import { InvoicingTab } from '@/components/processing/InvoicingTab';
import { PayrollTab } from '@/components/processing/PayrollTab';
import { useProcessing } from '@/lib/hooks/useProcessing';
import { useMemo } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DateNavigation } from '@/components/timesheet/DateNavigation';

export default function Processing() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('invoicing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    clientId: '',
    status: '',
    priority: '',
    type: ''
  });

  const { data, isLoading, updateStatus, isUpdating } = useProcessing(selectedMonth);

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    if (!data?.projects) return [];
    
    return data.projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          project.name.toLowerCase().includes(searchTerm) ||
          project.clientName.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Client filter
      if (filters.clientId && project.clientId !== filters.clientId) {
        return false;
      }

      // Status filter
      if (filters.status && project.invoiceStatus !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && project.priority !== filters.priority) {
        return false;
      }

      // Type filter
      if (filters.type && project.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [data?.projects, filters]);

  const handlePrevious = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setSelectedMonth(new Date());
  };

  if (isLoading || !data) {
    return <LoadingScreen />;
  }

  const month = format(selectedMonth, 'yyyy-MM');
  
  return (
    <div className="space-y-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Processing</h1>
        </div>
        
        <div>
          <DateNavigation
            currentDate={selectedMonth}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            formatString="MMMM yyyy"
          />
        </div>
      </div>

      <ProcessingSummary data={data} month={month} />
      
      <ProcessingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'invoicing' && (
        <InvoicingTab
          projects={filteredProjects}
          onUpdateStatus={updateStatus}
          onFilterChange={setFilters}
          isUpdating={isUpdating}
          month={month}
        />
      )}

      {activeTab === 'payroll' && <PayrollTab />}
    </div>
  );
}