import { useState, useEffect } from 'react';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { DollarSign, Plus, Trash2, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import type { User, SalaryItem, CostRate } from '@/types';

interface RatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (updates: { salary?: SalaryItem[]; costRate?: CostRate[] }) => Promise<void>;
}

export function RatesDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: RatesDialogProps) {
  // Initialize salary history
  const [salaryHistory, setSalaryHistory] = useState<SalaryItem[]>([]);

  // Initialize cost rate history
  const [costRateHistory, setCostRateHistory] = useState<CostRate[]>([]);

  // Form state
  const [newSalary, setNewSalary] = useState('');
  const [newCostRate, setNewCostRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize history when user changes
  useEffect(() => {
    if (user) {
      // Initialize salary history
      const initialSalaryHistory = Array.isArray(user.salary) ? user.salary : [];
      setSalaryHistory(initialSalaryHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      
      // Initialize cost rate history
      const initialCostRateHistory = Array.isArray(user.costRate) ? user.costRate : [];
      setCostRateHistory(initialCostRateHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }, [user]);

  const handleAddSalary = () => {
    const salary = parseFloat(newSalary);
    const date = new Date(effectiveDate);

    if (isNaN(salary) || !date || !isFinite(date.getTime())) return;

    // Check if date is valid
    const latestDate = salaryHistory[0]?.date ? new Date(salaryHistory[0].date) : null;
    if (latestDate && date < latestDate) {
      alert('New date cannot be before the latest existing date');
      return;
    }

    const newHistory = [
      { salary, date: date.toISOString() },
      ...salaryHistory
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setSalaryHistory(newHistory);
    setNewSalary('');
    setEffectiveDate('');

    // Auto-calculate cost rate for employees
    if (user.employeeType === 'employee') {
      const annualWorkingHours = 52 * 38; // Fixed 38 hour week
      const costRate = salary / annualWorkingHours;
      const roundedCostRate = Math.round(costRate * 100) / 100;

      const newCostRateHistory = [
        { costRate: roundedCostRate, date: date.toISOString() },
        ...costRateHistory
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setCostRateHistory(newCostRateHistory);
    }
  };

  const handleAddCostRate = () => {
    const costRate = parseFloat(newCostRate);
    const date = new Date(effectiveDate);

    if (isNaN(costRate) || !date || !isFinite(date.getTime())) return;

    // Check if date is valid
    const latestDate = costRateHistory[0]?.date ? new Date(costRateHistory[0].date) : null;
    if (latestDate && date < latestDate) {
      alert('New date cannot be before the latest existing date');
      return;
    }

    const newHistory = [
      { costRate, date: date.toISOString() },
      ...costRateHistory
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setCostRateHistory(newHistory);
    setNewCostRate('');
    setEffectiveDate('');
  };

  const handleRemoveSalary = (index: number) => {
    const newHistory = [...salaryHistory];
    newHistory.splice(index, 1);
    setSalaryHistory(newHistory);
  };

  const handleRemoveCostRate = (index: number) => {
    const newHistory = [...costRateHistory];
    newHistory.splice(index, 1);
    setCostRateHistory(newHistory);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        salary: salaryHistory,
        costRate: costRateHistory
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save rates:', error);
      alert('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={user ? "Manage Rates" : "Loading..."}
      subtitle={user?.name}
      icon={<Calculator className="h-5 w-5 text-indigo-500" />}
    >
      {!user ? (
        <div className="p-6 text-center text-gray-500">Loading user data...</div>
      ) : (
      <div className="p-6 space-y-8">
        {/* Current Rates Summary */}
        <div className="grid grid-cols-2 gap-6">
          {user.employeeType === 'employee' && (
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-6 shadow-sm ring-1 ring-indigo-100">
              <div className="text-sm font-medium text-indigo-600 mb-2">Current Annual Salary</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${salaryHistory[0]?.salary.toLocaleString() || '0'}
                </span>
                <span className="text-sm text-gray-500">/year</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Last updated: {salaryHistory[0]?.date ? format(new Date(salaryHistory[0].date), 'MMM d, yyyy') : 'Never'}
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-6 shadow-sm ring-1 ring-emerald-100">
            <div className="text-sm font-medium text-emerald-600 mb-2">Current Cost Rate</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                ${costRateHistory[0]?.costRate.toLocaleString() || '0'}
              </span>
              <span className="text-sm text-gray-500">/hour</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Last updated: {costRateHistory[0]?.date ? format(new Date(costRateHistory[0].date), 'MMM d, yyyy') : 'Never'}
            </div>
          </div>
        </div>

        {/* Salary Section */}
        {user.employeeType === 'employee' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Salary History</h3>
              <div className="text-sm text-gray-500">
                Cost rate is auto-calculated
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Annual Salary">
                  <Input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Enter salary"
                  />
                </FormField>
                <FormField label="Effective Date">
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </FormField>
              </div>
              <Button onClick={handleAddSalary} disabled={!newSalary || !effectiveDate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Salary
              </Button>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <Th>Annual Salary</Th>
                  <Th>Effective Date</Th>
                  <Th></Th>
                </tr>
              </TableHeader>
              <TableBody>
                {salaryHistory.map((item, index) => (
                  <tr key={index}>
                    <Td>${item.salary.toLocaleString()}</Td>
                    <Td>{format(new Date(item.date), 'MMM d, yyyy')}</Td>
                    <Td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveSalary(index)}
                        disabled={index === salaryHistory.length - 1}
                        title={index === salaryHistory.length - 1 ? "Cannot remove oldest salary record" : undefined}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Cost Rate Section */}
        {user.employeeType !== 'employee' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Cost Rate History</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Cost Rate">
                  <Input
                    type="number"
                    value={newCostRate}
                    onChange={(e) => setNewCostRate(e.target.value)}
                    placeholder="Enter cost rate"
                  />
                </FormField>
                <FormField label="Effective Date">
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </FormField>
              </div>
              <Button onClick={handleAddCostRate} disabled={!newCostRate || !effectiveDate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Rate
              </Button>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <Th>Cost Rate</Th>
                  <Th>Effective Date</Th>
                  <Th></Th>
                </tr>
              </TableHeader>
              <TableBody>
                {costRateHistory.map((item, index) => (
                  <tr key={index}>
                    <Td>${item.costRate.toLocaleString()}/hr</Td>
                    <Td>{format(new Date(item.date), 'MMM d, yyyy')}</Td>
                    <Td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveCostRate(index)}
                        disabled={index === costRateHistory.length - 1}
                        title={index === costRateHistory.length - 1 ? "Cannot remove oldest cost rate record" : undefined}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </div>
      )}
    </SlidePanel>
  );
}