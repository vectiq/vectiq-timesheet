import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import type { ProjectForecast } from '@/types/forecasting';

interface ForecastChartProps {
  forecasts: ProjectForecast[];
}

export function ForecastChart({ forecasts }: ForecastChartProps) {
  const data = useMemo(() => 
    forecasts.map(forecast => ({
      month: format(parseISO(forecast.month + '-01'), 'MMM yyyy'),
      forecastedRevenue: forecast.totalForecastedRevenue,
      actualRevenue: forecast.totalActualRevenue,
      forecastedCost: forecast.totalForecastedCost,
      actualCost: forecast.totalActualCost,
      forecastedGM: forecast.grossMargin,
      actualGM: forecast.actualGrossMargin,
    })),
    [forecasts]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-medium">
              {entry.name.includes('GM') 
                ? `${entry.value.toFixed(1)}%`
                : formatCurrency(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Revenue Lines */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="forecastedRevenue"
          name="Forecasted Revenue"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="actualRevenue"
          name="Actual Revenue"
          stroke="#818cf8"
          strokeWidth={2}
          dot={false}
        />

        {/* Cost Lines */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="forecastedCost"
          name="Forecasted Cost"
          stroke="#059669"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="actualCost"
          name="Actual Cost"
          stroke="#34d399"
          strokeWidth={2}
          dot={false}
        />

        {/* Gross Margin Lines */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="forecastedGM"
          name="Forecasted GM%"
          stroke="#b91c1c"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="actualGM"
          name="Actual GM%"
          stroke="#f87171"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}