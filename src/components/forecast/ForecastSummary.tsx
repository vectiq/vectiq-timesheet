import { TrendingUp, TrendingDown } from 'lucide-react';
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
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative space-y-2">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <h3 className="font-semibold">Forecast Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentMonth.revenue)}
          </p>
          <div className={`mt-4 flex items-center ${revenueTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {revenueTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {formatCurrency(Math.abs(revenueDiff))} variance
            </span>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative space-y-2">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <h3 className="font-semibold">Forecast Costs</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentMonth.costs)}
          </p>
          <div className={`mt-4 flex items-center ${costsTrend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
            {costsTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {formatCurrency(Math.abs(costsDiff))} variance
            </span>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative space-y-2">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <h3 className="font-semibold">Gross Margin</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentGrossMargin)}
          </p>
          <div className={`mt-4 flex items-center ${grossMarginTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {grossMarginTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {formatCurrency(Math.abs(grossMarginDiff))} variance
            </span>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <h3 className="font-semibold">Margin %</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(currentMonth.revenue > 0 
              ? (currentGrossMargin / currentMonth.revenue) * 100 
              : 0).toFixed(1)}%
          </p>
          <div className={`mt-4 flex items-center ${marginTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {marginTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(marginDiff).toFixed(1)}% variance
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}