import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import { format, addMonths, startOfMonth } from 'date-fns';
import { getWorkingDaysForMonth, calculateDefaultHours } from '@/lib/utils/workingDays';
import { calculateForecastHours, calculateForecastFinancials } from '@/lib/services/forecasts';
import type { Project, User } from '@/types';

interface ChartData {
  month: string;
  forecastRevenue: number;
  actualRevenue: number;
  forecastCost: number;
  actualCost: number;
  forecastGM: number;
  actualGM: number;
}

interface ForecastChartProps {
  startDate: Date;
  endDate: Date;
  forecasts: any[];
  actuals: any;
  projects: Project[];
  users: User[];
  isYearlyView?: boolean;
}

const VIEW_OPTIONS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'cost', label: 'Cost' },
  { id: 'gm', label: 'Gross Margin' }
] as const;

export function ForecastChart({ 
  startDate, 
  endDate, 
  forecasts, 
  actuals,
  projects,
  users,
  isYearlyView 
}: ForecastChartProps) {
  const [view, setView] = useState<'revenue' | 'cost' | 'gm'>('revenue');

  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    let currentDate = startOfMonth(startDate);

    while (currentDate <= endDate) {
      const monthKey = format(currentDate, 'yyyy-MM');
      const monthWorkingDays = getWorkingDaysForMonth(monthKey);

      // Initialize month totals
      let forecastRevenue = 0;
      let forecastCost = 0;

      projects.forEach(project => {
        project.tasks.forEach(task => {
          task.userAssignments?.forEach(assignment => {
            const user = users.find(u => u.id === assignment.userId);
            if (!user) return;

            // Get forecast hours
            const { hours } = calculateForecastHours({
              forecasts,
              userId: user.id,
              projectId: project.id,
              taskId: task.id,
              workingDays: monthWorkingDays,
              hoursPerWeek: user.hoursPerWeek || 40,
              isYearlyView: false
            });

            // Calculate forecast financials
            const { revenue } = calculateForecastFinancials({
              hours,
              taskRate: task.sellRate,
              userRate: user.sellRate
            });

            const { cost } = calculateForecastFinancials({
              hours,
              taskRate: task.costRate,
              userRate: user.costRate
            });

            forecastRevenue += revenue;
            forecastCost += cost;
          });
        });
      });
      
      // Get actuals for the month
      const monthActuals = actuals?.entries?.filter(entry => 
        format(new Date(entry.date), 'yyyy-MM') === monthKey
      ) || [];
      
      const actualRevenue = monthActuals.reduce((sum, entry) => sum + entry.revenue, 0);
      const actualCost = monthActuals.reduce((sum, entry) => sum + entry.cost, 0);
      
      data.push({
        month: format(currentDate, 'MMM yy'),
        forecastRevenue,
        actualRevenue,
        forecastCost,
        actualCost,
        forecastGM: forecastRevenue - forecastCost,
        actualGM: actualRevenue - actualCost
      });
      
      currentDate = addMonths(currentDate, 1);
    }
    
    return data;
  }, [startDate, endDate, forecasts, actuals, projects, users]);

  const formatYAxis = (value: number) => formatCurrency(value);

  const getChartConfig = () => {
    switch (view) {
      case 'revenue':
        return {
          lines: [
            { key: 'forecastRevenue', name: 'Forecast Revenue', color: '#60a5fa' },
            { key: 'actualRevenue', name: 'Actual Revenue', color: '#3b82f6' }
          ],
          title: 'Revenue Over Time'
        };
      case 'cost':
        return {
          lines: [
            { key: 'forecastCost', name: 'Forecast Cost', color: '#f87171' },
            { key: 'actualCost', name: 'Actual Cost', color: '#ef4444' }
          ],
          title: 'Cost Over Time'
        };
      case 'gm':
        return {
          lines: [
            { key: 'forecastGM', name: 'Forecast GM', color: '#34d399' },
            { key: 'actualGM', name: 'Actual GM', color: '#10b981' }
          ],
          title: 'Gross Margin Over Time'
        };
    }
  };

  const config = getChartConfig();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
        <div className="flex rounded-lg shadow-sm">
          {VIEW_OPTIONS.map(option => (
            <Button
              key={option.id}
              variant={view === option.id ? 'primary' : 'secondary'}
              className={cn(
                option.id === 'revenue' && 'rounded-r-none',
                option.id === 'gm' && 'rounded-l-none',
                option.id === 'cost' && 'rounded-none border-l-0 border-r-0'
              )}
              onClick={() => setView(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{
                paddingBottom: '20px'
              }}
            />
            {config.lines.map(line => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}