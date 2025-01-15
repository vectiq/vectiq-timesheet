import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers } from '@/lib/hooks/useUsers';
import { cn } from '@/lib/utils/styles';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/ui/FormField';
import { UserIcon, Mail, Shield, Briefcase, Calculator, Link, UserCheck, DollarSign, History } from 'lucide-react';
import type { User } from '@/types';
import { SalaryHistoryDialog } from './SalaryHistoryDialog';
import { CostRateHistoryDialog } from './CostRateHistoryDialog';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: User) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserDialogProps) {
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [isCostRateHistoryOpen, setCostRateHistoryOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }, 
    reset,
  } = useForm<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: user || {
      email: '',
      name: '',
      employeeType: 'employee',
      role: 'user',
      leaveApproverId: '',
      projectAssignments: [],
      hoursPerWeek: 40,
      overtime: 'no',
    },
  });

  const { users } = useUsers();
  const employeeType = watch('employeeType');
  const currentLeaveApproverId = watch('leaveApproverId');

  // Get current salary and cost rate
  const currentSalary = useMemo(() => {
    if (!user?.salary?.length) return null;
    return user.salary.sort((a, b) => b.date.getTime() - a.date.getTime())[0].salary;
  }, [user?.salary]);

  const currentCostRate = useMemo(() => {
    if (!user?.costRate?.length) return null;
    return user.costRate.sort((a, b) => b.date.getTime() - a.date.getTime())[0].costRate;
  }, [user?.costRate]);
  // Calculate cost rate from salary for employees
  useEffect(() => {
    if (employeeType === 'employee' && currentSalary) {
      const annualWorkingHours = 52 * 38; // Fixed 38 hour week
      const costRate = currentSalary / annualWorkingHours;
      setValue('costRate', Math.round(costRate * 100) / 100);
    }
  }, [employeeType, currentSalary, setValue]);
  useEffect(() => {
    if (open) {
      reset(user || {
        email: '',
        name: '',
        role: 'user',
        hoursPerWeek: 40,
        overtime: 'no',
        projectAssignments: [],
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: any) => {
    const userData = user ? { ...data, id: user.id } : data;
    await onSubmit(userData);
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={user ? 'Edit User' : 'New User'}
      subtitle={!user ? 'A temporary password will be generated and a password reset email will be sent.' : undefined}
      icon={<UserIcon className="h-5 w-5 text-indigo-500" />}
    >
      <div className="p-6">

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4" />
              Basic Information
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Name">
                <Input
                  {...register('name')}
                  placeholder="Enter full name"
                />
              </FormField>

              <FormField label="Email">
                <Input
                  {...register('email')}
                  readOnly={!!user}
                  disabled={!!user}
                  className={cn(
                    user && "bg-gray-50"
                  )}
                  placeholder="email@example.com"
                />
                {user && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email can only be changed in profile settings
                  </p>
                )}
              </FormField>
            </div>

            <FormField label="Role">
              <Select 
                value={watch('role')} 
                onValueChange={(value) => setValue('role', value)}
              >
                <SelectTrigger>
                  {watch('role') === 'admin' ? 'Admin' : 'User'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4" />
              Employment Details
            </div>
            
            <div className="space-y-4">
              <FormField label="Employee Type">
                <Select 
                  value={watch('employeeType')} 
                  onValueChange={(value) => setValue('employeeType', value)}
                >
                  <SelectTrigger>
                    {watch('employeeType')?.charAt(0).toUpperCase() + watch('employeeType')?.slice(1) || 'Select Type'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Hours Per Week">
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    {...register('hoursPerWeek', { 
                      valueAsNumber: true,
                      min: 0,
                      max: 168
                    })}
                  />
                </FormField>

                <FormField label="Overtime">
                  <Select 
                    value={watch('overtime')} 
                    onValueChange={(value) => setValue('overtime', value)}
                  >
                    <SelectTrigger>
                      {watch('overtime') === 'no' ? 'No Overtime' :
                       watch('overtime') === 'eligible' ? 'Eligible Projects Only' :
                       watch('overtime') === 'all' ? 'All Projects' : 'Select Overtime Type'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No Overtime</SelectItem>
                      <SelectItem value="eligible">Eligible Projects Only</SelectItem>
                      <SelectItem value="all">All Projects</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          </div>
          
          {employeeType === 'employee' && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calculator className="h-4 w-4" />
                Salary Information
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">Current Annual Salary</div>
                  {currentSalary ? (
                    <div className="text-2xl font-semibold mt-1">${currentSalary.toLocaleString()}</div>
                  ) : (
                    <div className="text-sm text-gray-500 mt-1">No salary set</div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSalaryHistoryOpen(true);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Manage History
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4" />
              Sell Rate
            </div>
            <FormField label="Sell Rate ($/hr)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('sellRate', { valueAsNumber: true })}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                The sell rate is used for billing clients. Cost rates are managed separately.
              </p>
            </FormField>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="h-4 w-4" />
              Leave Approval
            </div>
            
            <FormField label="Leave Approver">
              <Select
                value={currentLeaveApproverId}
                onValueChange={(value) => setValue('leaveApproverId', value)}
                defaultValue={null}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approver">
                    {currentLeaveApproverId ? users.find(u => u.id === currentLeaveApproverId)?.name : 'Select approver'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No approver</SelectItem>
                  {users
                    .filter(u => u.id !== user?.id) // Can't select self as approver
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Select who should approve this user's leave requests
              </p>
            </FormField>
          </div>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Link className="h-4 w-4" />
              Integration Settings
            </div>
            <FormField label="Xero Employee ID">
              <Input
                {...register('xeroEmployeeId')}
                placeholder="e.g., EMP001"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)} 
            >
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </div>
    </SlidePanel>
  );
}