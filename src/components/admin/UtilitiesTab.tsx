import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import type { TestDataOptions } from '@/types';

interface UtilitiesTabProps {
  onGenerateTestData: (options: TestDataOptions) => Promise<void>;
  onClearTestData: () => Promise<void>;
  onCleanupOrphanedData: () => Promise<void>;
  onValidateTimeEntries: () => Promise<{ invalid: number; fixed: number }>;
  isGenerating: boolean;
  isClearing: boolean;
  isCleaning: boolean;
  isValidating: boolean;
}

export function UtilitiesTab({
  onGenerateTestData,
  onClearTestData,
  onCleanupOrphanedData,
  onValidateTimeEntries,
  isGenerating,
  isClearing,
  isCleaning,
  isValidating,
}: UtilitiesTabProps) {
  return (
    <Card className="divide-y divide-gray-200">
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Test Data Generator</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate test time entries and approvals for testing purposes
            </p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await onGenerateTestData({
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              maxDailyHours: Number(formData.get('maxDailyHours')),
              generateApprovals: formData.get('generateApprovals') === 'true',
              approvalStatus: {
                pending: Number(formData.get('pendingWeight')),
                approved: Number(formData.get('approvedWeight')),
                rejected: Number(formData.get('rejectedWeight')),
                withdrawn: Number(formData.get('withdrawnWeight'))
              }
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date">
                <input
                  type="date"
                  name="startDate"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormField>

              <FormField label="End Date">
                <input
                  type="date"
                  name="endDate"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormField>
            </div>

            <FormField label="Maximum Daily Hours">
              <input
                type="number"
                name="maxDailyHours"
                min="1"
                max="24"
                step="0.5"
                defaultValue="12"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </FormField>

            <div className="space-y-4 pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="generateApprovals"
                  value="true"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Generate Approvals</span>
              </label>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Approval Status Weights</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Pending">
                    <input
                      type="number"
                      name="pendingWeight"
                      min="0"
                      max="100"
                      defaultValue="10"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>
                  <FormField label="Approved">
                    <input
                      type="number"
                      name="approvedWeight"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>
                  <FormField label="Rejected">
                    <input
                      type="number"
                      name="rejectedWeight"
                      min="0"
                      max="100"
                      defaultValue="5"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>
                  <FormField label="Withdrawn">
                    <input
                      type="number"
                      name="withdrawnWeight"
                      min="0"
                      max="100"
                      defaultValue="5"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClearTestData}
                disabled={isClearing}
              >
                {isClearing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Clear Test Data
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Test Data
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Clean Orphaned Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Remove any orphaned records and clean up inconsistent data
            </p>
          </div>
          <Button
            onClick={onCleanupOrphanedData}
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
              const result = await onValidateTimeEntries();
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
  );
}