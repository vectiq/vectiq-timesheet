import { useState } from 'react';
import { format } from 'date-fns';
import { 
  FileCheck, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Filter, 
  StickyNote,
  Bell
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProcessingTable } from '@/components/processing/ProcessingTable';
import { ProcessingFilters } from '@/components/processing/ProcessingFilters';
import { ProcessingNotes } from '@/components/processing/ProcessingNotes';
import { ProcessingSummary } from '@/components/processing/ProcessingSummary';
import { useProcessing } from '@/lib/hooks/useProcessing';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Badge } from '@/components/ui/Badge';
import { DateNavigation } from '@/components/timesheet/DateNavigation';

export default function MonthlyProcessing() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { data, isLoading } = useProcessing(selectedMonth);

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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Monthly Processing</h1>
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

      <ProcessingSummary data={data} />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <ProcessingFilters />
            </div>
            <ProcessingTable projects={data.projects} />
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          <ProcessingNotes />
        </div>
      </div>
    </div>
  );
}