import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: Array<{
    value: string | number;
    label: string;
    color?: string;
  }>;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  icon,
  stats,
  headerAction,
  children,
}: SlidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            {headerAction}
          </div>

          {/* Stats Grid */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 py-4 px-6 border-b">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div 
                    className={`text-2xl font-semibold ${stat.color || 'text-gray-900'}`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}