import { Button } from '@/components/ui/Button';
import { CalendarDays, Calendar } from 'lucide-react';

interface ViewSwitcherProps {
  view: 'weekly' | 'monthly';
  onViewChange: (view: 'weekly' | 'monthly') => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={view === 'weekly' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onViewChange('weekly')}
      >
        <CalendarDays className="h-4 w-4 mr-2" />
        Weekly
      </Button>
      <Button
        variant={view === 'monthly' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onViewChange('monthly')}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Monthly
      </Button>
    </div>
  );
}