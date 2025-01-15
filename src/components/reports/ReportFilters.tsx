import { useProjects } from '@/lib/hooks/useProjects';
import { useUsers } from '@/lib/hooks/useUsers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Download } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import type { ReportFilters, User } from '@/types';

interface ReportFiltersProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

export function ReportFilters({ filters, onChange }: ReportFiltersProps) {
  const { projects } = useProjects();
  const { users } = useUsers();

  const handleChange = (key: keyof ReportFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleExport = () => {
    console.log('Exporting with filters:', filters);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
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

          <FormField label="User">
            <select
              value={filters.userId || ''}
              onChange={(e) => handleChange('userId', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Users</option>
              {users.sort((a, b) => a.name.localeCompare(b.name)).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Project">
            <select
              value={filters.projectId || ''}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
}