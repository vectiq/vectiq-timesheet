import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Loader2, Search, Database, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { TestDataOptions } from '@/types';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';

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
  const { users } = useUsers();
  const { projects } = useProjects();
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  // Calculate default date range (last 3 months)
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const defaultStartDate = format(threeMonthsAgo, 'yyyy-MM-dd');
  const defaultEndDate = format(today, 'yyyy-MM-dd');

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
              Generate test time entries for billable projects
            </p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            const options: TestDataOptions = {
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              maxDailyHours: Number(formData.get('maxDailyHours')),
              minDailyHours: Number(formData.get('minDailyHours')),
              includeWeekends: formData.get('includeWeekends') === 'true'
            };

            // Build debug info before generating data
            const debugData: Record<string, any> = {};
            
            users.forEach(user => {
              const userAssignments = [];
              projects.forEach(project => {
                project.tasks?.forEach(task => {
                  if (task.billable && task.userAssignments?.some(a => a.userId === user.id)) {
                    userAssignments.push({
                      projectName: project.name,
                      taskName: task.name,
                      billable: task.billable
                    });
                  }
                });
              });
              
              if (userAssignments.length > 0) {
                debugData[user.name] = userAssignments;
              }
            });
            
            setDebugInfo(debugData);
            
            await onGenerateTestData(options);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date">
                <Input
                  type="date"
                  name="startDate"
                  defaultValue={defaultStartDate}
                  required
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="date"
                  name="endDate"
                  defaultValue={defaultEndDate}
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
                defaultValue={10}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum hours that can be assigned per day per employee
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Maximum hours that can be assigned per day per employee
              </p>
            </FormField>

            <FormField label="Minimum Daily Hours">
              <Input
                type="number"
                name="minDailyHours"
                min="0"
                max="24"
                step="0.5"
                defaultValue={6}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum hours that will be assigned per day per employee
              </p>
            </FormField>

            <FormField>
              <Checkbox
                name="includeWeekends"
                label="Include weekends"
              />
            </FormField>

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClearTestData}
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear Test Data
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Generate Test Data
              </Button>
            </div>
          </form>
          
          {/* Debug Panel */}
          {Object.keys(debugInfo).length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900">User Task Allocations</h4>
              </div>
              <div className="space-y-4">
                {Object.entries(debugInfo).map(([userName, assignments]) => (
                  <div key={userName} className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">{userName}</h5>
                    <div className="space-y-2">
                      {(assignments as any[]).map((assignment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-700">{assignment.projectName}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-600">{assignment.taskName}</span>
                          <span className="ml-auto text-green-600 text-xs font-medium">
                            Billable
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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