import { formatCurrency } from '@/lib/utils/currency';
import { useRoles } from '@/lib/hooks/useRoles';
import { FormField } from '@/components/ui/FormField';
import type { ProjectRole } from '@/types';

interface ProjectRatesProps {
  selectedRoleIds: string[];
  onRateChange: (roleId: string, rates: { costRate: number; sellRate: number }) => void;
  rates: Record<string, ProjectRole>;
}

export function ProjectRates({ selectedRoleIds, onRateChange, rates }: ProjectRatesProps) {
  const { roles } = useRoles();
  const selectedRoles = roles.filter(role => selectedRoleIds.includes(role.id));

  const handleRateChange = (roleId: string, rates: { 
    costRate: number; 
    sellRate: number;
    billable: boolean;
  }) => {
    onRateChange(roleId, {
      costRate: rates.costRate || 0,
      sellRate: rates.sellRate || 0,
      billable: rates.billable || false
    });
  };

  return (
    <div className="space-y-4">
      {selectedRoles.map(role => (
        <div key={role.id} className="grid grid-cols-2 gap-4">
          <FormField label={`${role.name} - Cost Rate`}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rates[role.id]?.costRate || ''}
              onChange={(e) => onRateChange(role.id, {
                costRate: parseFloat(e.target.value) || 0,
                sellRate: rates[role.id]?.sellRate || 0,
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label={`${role.name} - Sell Rate`}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rates[role.id]?.sellRate || ''}
              onChange={(e) => onRateChange(role.id, {
                costRate: rates[role.id]?.costRate || 0,
                sellRate: parseFloat(e.target.value) || 0,
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>
        </div>
      ))}

      {selectedRoles.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <div className="text-sm text-gray-500">Rate Summary</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Cost Rate:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(Object.values(rates).reduce((sum, rate) => sum + (rate.costRate || 0), 0))}/hr
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Bill Rate:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(Object.values(rates).reduce((sum, rate) => sum + (rate.sellRate || 0), 0))}/hr
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}