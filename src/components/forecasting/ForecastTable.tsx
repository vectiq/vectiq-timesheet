import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import type { ProjectForecast } from '@/types/forecasting';

interface ForecastTableProps {
  forecasts: ProjectForecast[];
}

export function ForecastTable({ forecasts }: ForecastTableProps) {
  return (
    <Table>
      <TableHeader>
        <tr>
          <Th>Month</Th>
          <Th>Hours (F/A)</Th>
          <Th>Cost (F/A)</Th>
          <Th>Revenue (F/A)</Th>
          <Th>GM% (F/A)</Th>
          <Th>Variance</Th>
        </tr>
      </TableHeader>
      <TableBody>
        {forecasts.map((forecast) => (
          <tr key={forecast.id}>
            <Td className="font-medium">
              {format(new Date(forecast.month + '-01'), 'MMMM yyyy')}
            </Td>
            <Td>
              <div className="space-y-1">
                <div>{forecast.totalForecastedHours.toFixed(1)}</div>
                <div className="text-sm text-gray-500">
                  {forecast.totalActualHours.toFixed(1)}
                </div>
              </div>
            </Td>
            <Td>
              <div className="space-y-1">
                <div>{formatCurrency(forecast.totalForecastedCost)}</div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(forecast.totalActualCost)}
                </div>
              </div>
            </Td>
            <Td>
              <div className="space-y-1">
                <div>{formatCurrency(forecast.totalForecastedRevenue)}</div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(forecast.totalActualRevenue)}
                </div>
              </div>
            </Td>
            <Td>
              <div className="space-y-1">
                <div>{forecast.grossMargin.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">
                  {forecast.actualGrossMargin.toFixed(1)}%
                </div>
              </div>
            </Td>
            <Td>
              <Badge
                variant={
                  Math.abs(forecast.variance.grossMargin) > 10
                    ? 'destructive'
                    : Math.abs(forecast.variance.grossMargin) > 5
                    ? 'warning'
                    : 'success'
                }
              >
                {forecast.variance.grossMargin > 0 ? '+' : ''}
                {forecast.variance.grossMargin.toFixed(1)}%
              </Badge>
            </Td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}