import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils/styles';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/ui/FormField';
import { DollarSign, UserIcon, Mail, Shield, Briefcase, Calculator, Link } from 'lucide-react';
import type { User } from '@/types';

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
      projectAssignments: [],
      hoursPerWeek: 40,
      overtime: 'no',
    },
  });

  const employeeType = watch('employeeType');
  const salary = watch('salary');

  // Calculate cost rate from salary for employees
  useEffect(() => {
    if (employeeType === 'employee' && salary) {
      const annualWorkingHours = 52 * 38; // Fixed 38 hour week
      const costRate = salary / annualWorkingHours;
      setValue('costRate', Math.round(costRate * 100) / 100);
    }
  }, [employeeType, salary, setValue]);
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
                {...register('role')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
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
                  {...register('employeeType')}
                >
                  <option value="employee">Employee</option>
                  <option value="contractor">Contractor</option>
                  <option value="company">Company</option>
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
                    {...register('overtime')}
                  >
                    <option value="no">No Overtime</option>
                    <option value="eligible">Eligible Projects Only</option>
                    <option value="all">All Projects</option>
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
              <FormField label="Annual Salary Package (inc. Super)">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...register('salary', { valueAsNumber: true })}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </FormField>
            </div>
          )}

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4" />
              Billing Rates
            </div>
            <div className="grid grid-cols-2 gap-4">
            <FormField label="Cost Rate ($/hr)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('costRate', { valueAsNumber: true })}
                  disabled={employeeType === 'employee'}
                  className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    employeeType === 'employee' ? 'bg-gray-100' : ''
                  }`}                 
                  placeholder="0.00"
                />
              </div>
            </FormField>

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
            </FormField>
            </div>
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