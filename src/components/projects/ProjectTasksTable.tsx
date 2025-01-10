import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/lib/hooks/useTasks';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, X } from 'lucide-react';
import type { ProjectTask } from '@/types';

interface ProjectTasksTableProps {
  selectedTaskIds: string[];
  rates: Record<string, ProjectTask>;
  onRateChange: (taskId: string, rates: { costRate: number; sellRate: number; billable: boolean }) => void;
  onAddTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export function ProjectTasksTable({ 
  selectedTaskIds, 
  rates, 
  onRateChange,
  onAddTask,
  onRemoveTask,
}: ProjectTasksTableProps) {
  const { tasks } = useTasks();
  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
  const availableTasks = tasks.filter(task => 
    task.isActive && !selectedTaskIds.includes(task.id)
  );

  const handleRateChange = (taskId: string, rates: { costRate: number; sellRate: number; billable: boolean }) => {
    const currentTasks = tasks.filter(r => r.taskId !== taskId);
    setValue('tasks', [...currentTasks, { 
      taskId,
      projectId: project?.id || crypto.randomUUID(),
      costRate: rates.costRate,
      sellRate: rates.sellRate,
      billable: rates.billable
    }]);
  };

  return (
    <div className="space-y-4">
      {/* Add Task Control */}
      {availableTasks.length > 0 && (
        <div className="flex gap-2">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => onAddTask(e.target.value)}
            value=""
          >
            <option value="">Add task to project...</option>
            {availableTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          <Button 
            type="button"
            onClick={() => {
              const select = document.querySelector('select') as HTMLSelectElement;
              if (select.value) {
                onAddTask(select.value);
                select.value = '';
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tasks Table */}
      {selectedTasks.length > 0 && (
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-200">
              <Th>Task</Th>
              <Th>Cost Rate ($/hr)</Th>
              <Th>Sell Rate ($/hr)</Th>
              <Th>Billable</Th>
              <Th>Margin</Th>
              <Th className="w-16"></Th>
            </tr>
          </TableHeader>
          <TableBody>
            {selectedTasks.map(task => {
              const rate = rates[task.id] || { costRate: 0, sellRate: 0 };
              const margin = rate.sellRate > 0 
                ? ((rate.sellRate - rate.costRate) / rate.sellRate * 100).toFixed(1)
                : '0.0';

              return (
                <tr key={task.id}>
                  <Td className="font-medium">{task.name}</Td>
                  <Td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate.costRate || ''}
                      onChange={(e) => onRateChange(task.id, {
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
                      onChange={(e) => onRateChange(task.id, {
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
                      onChange={(e) => onRateChange(task.id, {
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
                      onClick={() => onRemoveTask(task.id)}
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