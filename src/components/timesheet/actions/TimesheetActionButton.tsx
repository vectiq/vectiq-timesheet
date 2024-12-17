import { Button } from '@/components/ui/Button';
import { LucideIcon } from 'lucide-react';

interface TimesheetActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function TimesheetActionButton({
  onClick,
  icon: Icon,
  label,
  variant = 'primary',
  disabled = false,
}: TimesheetActionButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}