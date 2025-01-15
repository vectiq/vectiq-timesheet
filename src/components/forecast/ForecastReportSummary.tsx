import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateDefaultHours } from '@/lib/utils/workingDays';
import type { ForecastEntry, ReportData, User, Project } from '@/types';

interface ForecastReportSummaryProps {
  forecasts: ForecastEntry[];
  actuals: ReportData;
  month: string;
  users: User[];
  projects: Project[];
  workingDays: number;
}

export function ForecastReportSummary({ 
  forecasts, 
  actuals, 
  month,
  users,
  projects,
  workingDays
}: ForecastReportSummaryProps) {
  const summary = useMemo(() => {
    // Calculate forecast totals
    let forecastRevenue = 0;
    let forecastCost = 0;

    // Helper to get hours for a forecast entry
    const getHours = (userId: string, projectId: string, taskId: string) => {
      const forecast = forecasts.find(f => 
        f.userId === userId && 
        f.projectId === projectId && 
        f.taskId === taskId
      );
      
      if (forecast) {
        return forecast.hours;
      }
      
      // Calculate default hours if no forecast exists and user is assigned to the task
      const project = projects.find(p => p.id === projectId);
      const task = project?.tasks.find(t => t.id === taskId);
      const isAssigned = task?.userAssignments?.some(a => a.userId === userId);
      
      if (isAssigned) {
        const user = users.find(u => u.id === userId);
        return calculateDefaultHours(workingDays, user?.hoursPerWeek || 40);
      }
      
      return 0;
    };

    // Calculate totals for all project task assignments
    projects.forEach(project => {
      project.tasks.forEach(task => {
        task.userAssignments?.forEach(assignment => {
          const user = users.find(u => u.id === assignment.userId);
          if (!user) return;
        
          const hours = getHours(user.id, project.id, task.id);
          
          const sellRate = task.sellRate || user.sellRate || 0;
          const costRate = task.costRate || user.costRate || 0;
          
          forecastRevenue += hours * sellRate;
          forecastCost += hours * costRate;
        });
      });
    });

    const forecastGrossMargin = forecastRevenue - forecastCost;
    const forecastMarginPercent = (forecastGrossMargin / forecastRevenue) * 100;

    const actualRevenue = actuals?.summary?.totalRevenue || 0;
    const actualCost = actuals?.summary?.totalCost || 0;
    const actualGrossMargin = actualRevenue - actualCost;
    const actualMarginPercent = (actualGrossMargin / actualRevenue) * 100 || 0;

    const revenueVariance = actualRevenue - forecastRevenue;
    const revenueVariancePercent = (revenueVariance / forecastRevenue) * 100;
    
    const costVariance = actualCost - forecastCost;
    const costVariancePercent = (costVariance / forecastCost) * 100;
    
    const marginVariance = actualGrossMargin - forecastGrossMargin;
    const marginPercentVariance = actualMarginPercent - forecastMarginPercent;

    return {
      forecast: {
        revenue: forecastRevenue,
        cost: forecastCost,
        grossMargin: forecastGrossMargin,
        marginPercent: forecastMarginPercent
      },
      actual: {
        revenue: actualRevenue,
        cost: actualCost,
        grossMargin: actualGrossMargin,
        marginPercent: actualMarginPercent
      },
      variance: {
        revenue: revenueVariance,
        revenuePercent: revenueVariancePercent,
        cost: costVariance,
        costPercent: costVariancePercent,
        margin: marginVariance,
        marginPercent: marginPercentVariance
      }
    };
  }, [forecasts, actuals, projects]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Revenue Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <DollarSign className="h-5 w-5" />
            <h3 className="font-semibold">Revenue</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Forecast</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.forecast.revenue)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.actual.revenue)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            {summary.variance.revenue >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              summary.variance.revenue >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.variance.revenuePercent.toFixed(1)}% variance
            </span>
          </div>
        </div>
      </Card>

      {/* Cost Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <DollarSign className="h-5 w-5" />
            <h3 className="font-semibold">Cost</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Forecast</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.forecast.cost)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.actual.cost)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            {summary.variance.cost <= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              summary.variance.cost <= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(summary.variance.costPercent).toFixed(1)}% variance
            </span>
          </div>
        </div>
      </Card>

      {/* Margin Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-10 rounded-full" />
        </div>
        <div className="p-6 relative">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Percent className="h-5 w-5" />
            <h3 className="font-semibold">Gross Margin</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Forecast</p>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.forecast.grossMargin)}
                </p>
                <p className="text-sm text-gray-500">
                  {summary.forecast.marginPercent.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Actual</p>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.actual.grossMargin)}
                </p>
                <p className="text-sm text-gray-500">
                  {summary.actual.marginPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            {summary.variance.marginPercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              summary.variance.marginPercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(summary.variance.marginPercent).toFixed(1)}% variance
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}