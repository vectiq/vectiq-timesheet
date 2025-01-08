import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import type { SystemConfig } from '@/types';

interface ConfigurationTabProps {
  config: SystemConfig;
  isUpdating: boolean;
  onUpdateConfig: (config: SystemConfig) => Promise<void>;
}

export function ConfigurationTab({ 
  config, 
  isUpdating, 
  onUpdateConfig
}: ConfigurationTabProps) {
  return (
    <Card className="p-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await onUpdateConfig({
            defaultHoursPerWeek: Number(formData.get('defaultHoursPerWeek')),
            defaultOvertimeType: formData.get('defaultOvertimeType') as any,
            requireApprovalsByDefault: formData.get('requireApprovalsByDefault') === 'true',
            allowOvertimeByDefault: formData.get('allowOvertimeByDefault') === 'true',
            defaultBillableStatus: formData.get('defaultBillableStatus') === 'true',
          });
        }}
        className="space-y-4"
      >
        <FormField label="Default Hours Per Week">
          <input
            type="number"
            name="defaultHoursPerWeek"
            defaultValue={config.defaultHoursPerWeek}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Default Overtime Type">
          <select
            name="defaultOvertimeType"
            defaultValue={config.defaultOvertimeType}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="no">No Overtime</option>
            <option value="eligible">Eligible Projects Only</option>
            <option value="all">All Projects</option>
          </select>
        </FormField>

        <div className="space-y-4 pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="requireApprovalsByDefault"
              value="true"
              defaultChecked={config.requireApprovalsByDefault}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Require approvals by default for new projects</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowOvertimeByDefault"
              value="true"
              defaultChecked={config.allowOvertimeByDefault}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Allow overtime by default for new projects</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="defaultBillableStatus"
              value="true"
              defaultChecked={config.defaultBillableStatus}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Set roles as billable by default</span>
          </label>
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      </form>
    </Card>
  );
}