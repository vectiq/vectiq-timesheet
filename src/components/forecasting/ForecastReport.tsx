import { useMemo } from 'react';
import { useState } from 'react';
import { useForecasting } from '@/lib/hooks/useForecasting';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ForecastTable } from '@/components/forecasting/ForecastTable';
import { ForecastChart } from '@/components/forecasting/ForecastChart';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, DollarSign, PieChart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProjectForecast } from '@/types/forecasting';

type YearType = 'calendar' | 'financial';

interface ForecastReportProps {
  forecasts: ProjectForecast[];
  yearType: YearType;
  selectedYear: number;
  onYearTypeChange: (type: YearType) => void;
  onYearChange: (year: number) => void;
}

export function ForecastReport({ 
  forecasts,
  yearType,
  selectedYear,
  onYearTypeChange,
  onYearChange
}: ForecastReportProps) {
  const handlePreviousYear = () => onYearChange(selectedYear - 1);
  const handleNextYear = () => onYearChange(selectedYear + 1);

  // Calculate yearly totals and averages
  const yearlyStats = useMemo(() => {
    if (!forecasts) return null;
    
    const totals = forecasts.reduce((acc, forecast) => ({
      forecastedRevenue: acc.forecastedRevenue + forecast.totalForecastedRevenue,
      actualRevenue: acc.actualRevenue + forecast.totalActualRevenue,
      forecastedCost: acc.forecastedCost + forecast.totalForecastedCost,
      actualCost: acc.actualCost + forecast.totalActualCost,
    }), {
      forecastedRevenue: 0,
      actualRevenue: 0,
      forecastedCost: 0,
      actualCost: 0,
    });

    const forecastedGM = (totals.forecastedRevenue - totals.forecastedCost) / totals.forecastedRevenue * 100;
    const actualGM = (totals.actualRevenue - totals.actualCost) / totals.actualRevenue * 100;

    return {
      ...totals,
      forecastedGM,
      actualGM,
      revenueVariance: ((totals.actualRevenue - totals.forecastedRevenue) / totals.forecastedRevenue) * 100,
      costVariance: ((totals.actualCost - totals.forecastedCost) / totals.forecastedCost) * 100,
      gmVariance: actualGM - forecastedGM,
    };
  }, [forecasts]);

  if (!yearlyStats) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Year Selection Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={yearType === 'calendar' ? 'primary' : 'secondary'}
            onClick={() => onYearTypeChange('calendar')}
          >
            Calendar Year
          </Button>
          <Button
            variant={yearType === 'financial' ? 'primary' : 'secondary'}
            onClick={() => onYearTypeChange('financial')}
          >
            Financial Year
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={handlePreviousYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {yearType === 'calendar' 
              ? selectedYear
              : `FY${selectedYear.toString().slice(2)}-${(selectedYear + 1).toString().slice(2)}`}
          </span>
          <Button variant="secondary" onClick={handleNextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Revenue</h3>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Forecasted</div>
                <div className="text-2xl font-semibold">{formatCurrency(yearlyStats.forecastedRevenue)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Actual</div>
                <div className="text-2xl font-semibold">{formatCurrency(yearlyStats.actualRevenue)}</div>
              </div>
              <div className={`text-sm font-medium ${yearlyStats.revenueVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearlyStats.revenueVariance >= 0 ? '+' : ''}{yearlyStats.revenueVariance.toFixed(1)}% variance
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Cost</h3>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Forecasted</div>
                <div className="text-2xl font-semibold">{formatCurrency(yearlyStats.forecastedCost)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Actual</div>
                <div className="text-2xl font-semibold">{formatCurrency(yearlyStats.actualCost)}</div>
              </div>
              <div className={`text-sm font-medium ${yearlyStats.costVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearlyStats.costVariance >= 0 ? '+' : ''}{yearlyStats.costVariance.toFixed(1)}% variance
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">Gross Margin</h3>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Forecasted</div>
                <div className="text-2xl font-semibold">{yearlyStats.forecastedGM.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Actual</div>
                <div className="text-2xl font-semibold">{yearlyStats.actualGM.toFixed(1)}%</div>
              </div>
              <div className={`text-sm font-medium ${yearlyStats.gmVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearlyStats.gmVariance >= 0 ? '+' : ''}{yearlyStats.gmVariance.toFixed(1)}% variance
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
          <div className="h-[400px]">
            <ForecastChart forecasts={forecasts} />
          </div>
        </div>
      </Card>

      {/* Detailed Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Monthly Breakdown</h3>
          <ForecastTable forecasts={forecasts} />
        </div>
      </Card>
    </div>
  );
}