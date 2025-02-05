import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, isValid, startOfDay, isSameDay, startOfWeek, startOfMonth, isSameMonth, isSameWeek, endOfWeek, endOfMonth } from 'date-fns';

interface DateNavigationProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  formatString: string;
}

export function DateNavigation({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  formatString,
}: DateNavigationProps) {
  // Safely format the date, escaping special characters if needed
  const formatDate = (date: Date) => {
    if (!isValid(date)) return '';
    try {
      return format(date, formatString.replace(/F/g, "'F'"));
    } catch (error) {
      console.error('Date formatting error:', error);
      return format(date, 'MMMM yyyy');
    }
  };

  // Get today's date at start of day for comparison
  const today = new Date();
  const startOfToday = startOfDay(today);
  
  // Determine if we're in monthly or weekly view based on format string
  const isMonthlyView = formatString.includes('yyyy') && !formatString.includes('d');
  
  // Get the start and end of the current period
  const periodStart = isMonthlyView 
    ? startOfMonth(currentDate)
    : startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Get the period containing today
  const todayPeriodStart = isMonthlyView 
    ? startOfMonth(startOfToday)
    : startOfWeek(startOfToday, { weekStartsOn: 1 });
  
  // Check if current period is aligned with today's period
  const isAlignedWithToday = isMonthlyView
    ? isSameMonth(periodStart, todayPeriodStart)
    : isSameWeek(periodStart, todayPeriodStart, { weekStartsOn: 1 });
  
  // Only show direction if not aligned with today
  const isBeforeToday = !isAlignedWithToday && periodStart < todayPeriodStart;
  const isAfterToday = !isAlignedWithToday && periodStart > todayPeriodStart;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onToday}
          className="flex items-center gap-1.5"
        >
          {isBeforeToday && <ArrowRight className="h-4 w-4 text-gray-500" />}
          {isAfterToday && <ArrowLeft className="h-4 w-4 text-gray-500" />}
          <span>Today</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-lg font-medium">
        {formatDate(currentDate)}
      </span>
    </div>
  );
}