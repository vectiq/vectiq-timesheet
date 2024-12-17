import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { WeeklyTimesheet } from '@/components/timesheet/WeeklyTimesheet';
import { TimesheetActions } from '@/components/timesheet/actions/TimesheetActions';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useProjects } from '@/lib/hooks/useProjects';

export default function TimeEntries() {
  const { timeEntries, isLoading: isLoadingEntries, createTimeEntry } = useTimeEntries();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoadingEntries || isLoadingProjects) {
    return <LoadingScreen />;
  }

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Save logic here
      console.log('Saving timesheet...');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit logic here
      console.log('Submitting timesheet...');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPrevious = () => {
    console.log('Copying previous week...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Weekly Timesheet</h1>
      </div>

      <WeeklyTimesheet
        projects={projects}
        timeEntries={timeEntries}
      />

      <Card className="p-4">
        <TimesheetActions
          onSave={handleSave}
          onSubmit={handleSubmit}
          onCopyPrevious={handleCopyPrevious}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}