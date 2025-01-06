import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useRoles } from '@/lib/hooks/useRoles';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, X } from 'lucide-react';
import type { ProjectRole } from '@/types';

interface ProjectRolesTableProps {
  selectedRoleIds: string[];
  rates: Record<string, ProjectRole>;
  onRateChange: (roleId: string, rates: { costRate: number; sellRate: number; billable: boolean }) => void;
  onAddRole: (roleId: string) => void;
  onRemoveRole: (roleId: string) => void;
}

export function ProjectRolesTable({ 
  selectedRoleIds, 
  rates, 
  onRateChange,
  onAddRole,
  onRemoveRole,
}: ProjectRolesTableProps) {
  const { roles } = useRoles();
  const selectedRoles = roles.filter(role => selectedRoleIds.includes(role.id));
  const availableRoles = roles.filter(role => 
    role.isActive && !selectedRoleIds.includes(role.id)
  );

  const handleRateChange = (roleId: string, rates: { costRate: number; sellRate: number; billable: boolean }) => {
    const currentRoles = roles.filter(r => r.roleId !== roleId);
    setValue('roles', [...currentRoles, { 
      roleId,
      projectId: project?.id || crypto.randomUUID(),
      costRate: rates.costRate,
      sellRate: rates.sellRate,
      billable: rates.billable
    }]);
  };

  return (
    <div className="space-y-4">
      {/* Add Role Control */}
      {availableRoles.length > 0 && (
        <div className="flex gap-2">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => onAddRole(e.target.value)}
            value=""
          >
            <option value="">Add role to project...</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <Button 
            type="button"
            onClick={() => {
              const select = document.querySelector('select') as HTMLSelectElement;
              if (select.value) {
                onAddRole(select.value);
                select.value = '';
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Roles Table */}
      {selectedRoles.length > 0 && (
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-200">
              <Th>Role</Th>
              <Th>Cost Rate ($/hr)</Th>
              <Th>Sell Rate ($/hr)</Th>
              <Th>Billable</Th>
              <Th>Margin</Th>
              <Th className="w-16"></Th>
            </tr>
          </TableHeader>
          <TableBody>
            {selectedRoles.map(role => {
              const rate = rates[role.id] || { costRate: 0, sellRate: 0 };
              const margin = rate.sellRate > 0 
                ? ((rate.sellRate - rate.costRate) / rate.sellRate * 100).toFixed(1)
                : '0.0';

              return (
                <tr key={role.id}>
                  <Td className="font-medium">{role.name}</Td>
                  <Td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate.costRate || ''}
                      onChange={(e) => onRateChange(role.id, {
                        costRate: parseFloat(e.target.value) || 0,
                        sellRate: rate.sellRate || 0,
                        billable: rate.billable || false
                      })}
                      className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </Td>
                  <Td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate.sellRate || ''}
                      onChange={(e) => onRateChange(role.id, {
                        costRate: rate.costRate || 0,
                        sellRate: parseFloat(e.target.value) || 0,
                        billable: rate.billable || false
                      })}
                      className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </Td>
                  <Td>
                    <input
                      type="checkbox"
                      checked={rate.billable || false}
                      onChange={(e) => onRateChange(role.id, {
                        costRate: rate.costRate || 0,
                        sellRate: rate.sellRate || 0,
                        billable: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </Td>
                  <Td>{margin}%</Td>
                  <Td>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onRemoveRole(role.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}