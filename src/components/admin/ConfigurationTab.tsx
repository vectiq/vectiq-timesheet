import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
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
          <Input
            type="number"
            name="defaultHoursPerWeek"
            defaultValue={config.defaultHoursPerWeek}
          />
        </FormField>

        <FormField label="Default Overtime Type">
          <Select
            name="defaultOvertimeType"
            defaultValue={config.defaultOvertimeType}
          >
            <option value="no">No Overtime</option>
            <option value="eligible">Eligible Projects Only</option>
            <option value="all">All Projects</option>
          </Select>
        </FormField>

        <div className="space-y-4 pt-4">
          <Checkbox
            name="requireApprovalsByDefault"
            value="true"
            defaultChecked={config.requireApprovalsByDefault}
            label="Require approvals by default for new projects"
          />

          <Checkbox
            name="allowOvertimeByDefault"
            value="true"
            defaultChecked={config.allowOvertimeByDefault}
            label="Allow overtime by default for new projects"
          />

          <Checkbox
            name="defaultBillableStatus"
            value="true"
            defaultChecked={config.defaultBillableStatus}
            label="Set tasks as billable by default"
          />
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