import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';

interface ForecastSummaryProps {
  currentMonth: {
    revenue: number;
    costs: number;
    margin: number;
  };
  previousMonth: {
    margin: number;
  };
}

export function ForecastSummary({ currentMonth, previousMonth }: ForecastSummaryProps) {
  const marginDiff = currentMonth.margin - previousMonth.margin;
  const marginTrend = marginDiff >= 0 ? 'up' : 'down';
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Forecast Revenue</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {formatCurrency(currentMonth.revenue)}
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Forecast Costs</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {formatCurrency(currentMonth.costs)}
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Gross Margin</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {formatCurrency(currentMonth.revenue - currentMonth.costs)}
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Margin %</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-semibold text-gray-900">
            {currentMonth.margin.toFixed(1)}%
          </p>
          <div className={`flex items-center ${marginTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {marginTrend === 'up' ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(marginDiff).toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}