import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Settings, Wrench, Calculator, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

const tabs = [
  { id: 'configuration', name: 'Configuration', icon: Settings },
  { id: 'utilities', name: 'Utilities', icon: Wrench },
  { id: 'calculations', name: 'Calculations', icon: Calculator }
] as const;

export default function Admin() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('configuration');
  const {
    config,
    stats,
    isLoading,
    updateConfig,
    recalculateProjectTotals,
    cleanupOrphanedData,
    validateTimeEntries,
    isUpdating,
    isRecalculating,
    isCleaning,
    isValidating
  } = useAdmin();

  if (isLoading || !config) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.totalUsers}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.totalProjects}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Hours This Month</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.totalHoursThisMonth.toFixed(1)}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Billable Hours</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.totalBillableHours.toFixed(1)}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Utilization</h3>
            <p className="mt-2 text-3xl font-semibold">{stats.averageUtilization}%</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 inline-block mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'configuration' && (
          <Card className="p-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await updateConfig({
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
        )}

        {activeTab === 'utilities' && (
          <Card className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Clean Orphaned Data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Remove any orphaned records and clean up inconsistent data
                  </p>
                </div>
                <Button
                  onClick={() => cleanupOrphanedData()}
                  disabled={isCleaning}
                >
                  {isCleaning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Run Cleanup
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Validate Time Entries</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Check for invalid time entries and fix data inconsistencies
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    const result = await validateTimeEntries();
                    alert(`Found ${result.invalid} invalid entries, fixed ${result.fixed}`);
                  }}
                  disabled={isValidating}
                >
                  {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Validate Entries
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'calculations' && (
          <Card className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Recalculate Project Totals</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update all project totals and verify calculations
                  </p>
                </div>
                <Button
                  onClick={() => recalculateProjectTotals()}
                  disabled={isRecalculating}
                >
                  {isRecalculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Recalculate
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}