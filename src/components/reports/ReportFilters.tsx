import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Search, Download } from 'lucide-react';
import type { ReportFilters } from '@/types';

interface ReportFiltersProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

export function ReportFilters({ filters, onChange }: ReportFiltersProps) {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const handleChange = (key: keyof ReportFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleExport = () => {
    console.log('Exporting with filters:', filters);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="End Date">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Clients">
            <select
              multiple
              value={filters.clientIds}
              onChange={(e) => handleChange('clientIds', Array.from(e.target.selectedOptions, option => option.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Projects">
            <select
              multiple
              value={filters.projectIds}
              onChange={(e) => handleChange('projectIds', Array.from(e.target.selectedOptions, option => option.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tasks">
            <select
              multiple
              value={filters.taskIds}
              onChange={(e) => handleChange('taskIds', Array.from(e.target.selectedOptions, option => option.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </Card>
  );
}