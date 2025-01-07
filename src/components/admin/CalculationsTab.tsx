import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

interface CalculationsTabProps {
  onRecalculateProjectTotals: () => Promise<void>;
  isRecalculating: boolean;
}

export function CalculationsTab({
  onRecalculateProjectTotals,
  isRecalculating,
}: CalculationsTabProps) {
  return (
    <Card className="divide-y divide-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Recalculate Project Totals</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update all project totals and verify calculations
            </p>
          </div>
          <Button
            onClick={onRecalculateProjectTotals}
            disabled={isRecalculating}
          >
            {isRecalculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Recalculate
          </Button>
        </div>
      </div>
    </Card>
  );
}