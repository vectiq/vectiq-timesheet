import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Loader2, Search } from 'lucide-react';
import type { TestDataOptions } from '@/types';

interface UtilitiesTabProps {
  onGenerateTestData: (options: TestDataOptions) => Promise<void>;
  onClearTestData: () => Promise<void>;
  onCleanupOrphanedData: () => Promise<void>;
  onValidateTimeEntries: () => Promise<{ invalid: number; fixed: number }>;
  onExportCollection: (collectionName: string) => Promise<void>;
  isGenerating: boolean;
  isClearing: boolean;
  isCleaning: boolean;
  isValidating: boolean;
  isExporting: boolean;
  exportedData?: string;
}

export function UtilitiesTab({
  onGenerateTestData,
  onClearTestData,
  onCleanupOrphanedData,
  onValidateTimeEntries,
  onExportCollection,
  isGenerating,
  isClearing,
  isCleaning,
  isValidating,
  isExporting,
  exportedData
}: UtilitiesTabProps) {
  const [weights, setWeights] = useState({
    pendingWeight: '10',
    approvedWeight: '80',
    rejectedWeight: '5',
    withdrawnWeight: '5'
  });
  const [collectionName, setCollectionName] = useState('');
  const [exportError, setExportError] = useState('');

  const handleExport = async () => {
    if (!collectionName.trim()) {
      setExportError('Please enter a collection name');
      return;
    }
    setExportError('');
    try {
      await onExportCollection(collectionName.trim());
    } catch (error) {
      setExportError(error.message);
    }
  };

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
                <Input
                  type="date"
                  name="startDate"
                  required
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="date"
                  name="endDate"
                  required
                />
              </FormField>
            </div>

            <FormField label="Maximum Daily Hours">
              <Input
                type="number"
                name="maxDailyHours"
                min="1"
                max="24"
                step="0.5"
                defaultValue={12}
                required
              />
            </FormField>

            <div className="space-y-4 pt-4">
              <Checkbox
                name="generateApprovals"
                value="true"
                onCheckedChange={(checked: boolean) => {
                  const form = document.querySelector('form');
                  const input = form.querySelector('input[name="generateApprovals"]');
                  if (input) {
                    (input as HTMLInputElement).checked = checked;
                  }
                }}
                defaultChecked
                label="Generate Approvals"
              />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Approval Status Weights</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Pending', name: 'pendingWeight', defaultValue: '10' },
                    { label: 'Approved', name: 'approvedWeight', defaultValue: '80' },
                    { label: 'Rejected', name: 'rejectedWeight', defaultValue: '5' },
                    { label: 'Withdrawn', name: 'withdrawnWeight', defaultValue: '5' }
                  ].map(({ label, name, defaultValue }) => (
                    <FormField key={name} label={label}>
                      <Select
                        value={weights[name] || defaultValue}
                        onValueChange={(value) => {
                          setWeights(prev => ({
                            ...prev,
                            [name]: value
                          }));
                        }}
                      >
                        <SelectTrigger>{weights[name] || defaultValue}%</SelectTrigger>
                        <SelectContent>
                          {[0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  ))}
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
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export Collection Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Export a Firestore collection as JSON
            </p>
          </div>
          <div className="flex items-end gap-3">
            <FormField label="Collection Name" error={exportError}>
              <Input
                type="text"
                value={collectionName}
                onChange={(e) => {
                  setCollectionName(e.target.value);
                  setExportError('');
                }}
                placeholder="e.g., users"
                className="w-64"
              />
            </FormField>
            <Button
              onClick={handleExport}
              disabled={isExporting || !collectionName.trim()}
              className="mb-4"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              View Collection
            </Button>
          </div>
        </div>
        {exportedData && (
          <div className="mt-4">
            <textarea
              readOnly
              value={exportedData}
              className="w-full h-96 font-mono text-sm p-4 rounded-md border border-gray-200 bg-gray-50"
            />
          </div>
        )}
      </div>
    </Card>
  );
}