import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateForecastHours, calculateForecastFinancials } from '@/lib/services/forecasts';
import type { User, Project } from '@/types';

interface ForecastSummaryProps {
  currentMonth: {
    revenue: number;
    costs: number;
    margin: number;
  };
  previousMonth: {
    revenue: number;
    costs: number;
    margin: number;
  };
}

export function ForecastSummary({ currentMonth, previousMonth }: ForecastSummaryProps) {
  const marginDiff = currentMonth.margin - previousMonth.margin;
  const marginTrend = marginDiff >= 0 ? 'up' : 'down';
  const revenueDiff = currentMonth.revenue - previousMonth.revenue;
  const revenueTrend = revenueDiff >= 0 ? 'up' : 'down';
  const costsDiff = currentMonth.costs - previousMonth.costs;
  const costsTrend = costsDiff >= 0 ? 'up' : 'down';
  const currentGrossMargin = currentMonth.revenue - currentMonth.costs;
  const previousGrossMargin = previousMonth.revenue - previousMonth.costs;
  const grossMarginDiff = currentGrossMargin - previousGrossMargin;
  const grossMarginTrend = grossMarginDiff >= 0 ? 'up' : 'down';
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Forecast Revenue</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-gray-900 truncate">
              {formatCurrency(currentMonth.revenue)}
            </p>
            <div className={`flex items-center mt-1 ${revenueTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {revenueTrend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="text-sm font-medium ml-1 truncate">
                {formatCurrency(Math.abs(revenueDiff))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Forecast Costs</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-gray-900 truncate">
              {formatCurrency(currentMonth.costs)}
            </p>
            <div className={`flex items-center mt-1 ${costsTrend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
              {costsTrend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="text-sm font-medium ml-1 truncate">
                {formatCurrency(Math.abs(costsDiff))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Gross Margin</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-gray-900 truncate">
              {formatCurrency(currentGrossMargin)}
            </p>
            <div className={`flex items-center mt-1 ${grossMarginTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {grossMarginTrend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="text-sm font-medium ml-1 truncate">
                {formatCurrency(Math.abs(grossMarginDiff))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Margin %</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-semibold text-gray-900">
              {(currentMonth.revenue > 0 
                ? (currentGrossMargin / currentMonth.revenue) * 100 
                : 0).toFixed(1)}%
            </p>
            <div className={`flex items-center mt-1 ${marginTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {marginTrend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(marginDiff).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}