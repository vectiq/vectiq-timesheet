import { useMemo, useState } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/styles';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/currency';
import { format, subMonths, parseISO } from 'date-fns';
import { getSellRateForDate, getCostRateForMonth } from '@/lib/utils/rates';
import { usePublicHolidays } from '@/lib/hooks/usePublicHolidays';
import { useLeaveForecasts } from '@/lib/hooks/useLeaveForecasts';
import { useBonuses } from '@/lib/hooks/useBonuses';
import { Save, Edit2 } from 'lucide-react';
import type { User, Project, ForecastEntry } from '@/types';

interface UserForecastTableProps {
  users: User[];
  projects: Project[];
  forecasts: ForecastEntry[];
  month: string;
  workingDays: number;
  onCreateForecast: (data: Omit<ForecastEntry, 'id'>) => Promise<void>;
  onUpdateForecast: (id: string, hours: number) => Promise<void>;
}

export function UserForecastTable({
  users,
  projects,
  forecasts,
  month,
  workingDays,
  onCreateForecast,
  onUpdateForecast
}: UserForecastTableProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { leaveData } = useLeaveForecasts(month);
  const { holidays } = usePublicHolidays(month);
  const { bonuses } = useBonuses(month);
  const [editData, setEditData] = useState<Record<string, {
    hoursPerWeek: number;
    estimatedBillablePercentage: number;
    forecastHours: number; 
  }>>({});

  // Separate users by type
  const { employees, contractors } = useMemo(() => {
    return users.reduce((acc, user) => {
      if (user.employeeType === 'employee') {
        acc.employees.push(user);
      } else if (user.employeeType === 'contractor') {
        acc.contractors.push(user);
      }
      return acc;
    }, { employees: [] as User[], contractors: [] as User[] });
  }, [users]);

  // Calculate historical sell rates for each user
  const historicalRates = useMemo(() => {
    const rates = new Map<string, number>();
    
    users.forEach(user => {
      let totalRate = 0;
      let totalAssignments = 0;

      // Look at last 3 months of assignments
      const date = new Date(month + '-01');
      for (let i = 0; i < 3; i++) {
        const monthDate = subMonths(date, i);
        const monthStr = format(monthDate, 'yyyy-MM-dd');

        // Get all billable assignments for this user
        projects.forEach(project => {
          project.tasks
            .filter(task => task.billable)
            .forEach(task => {
              const hasAssignment = task.userAssignments?.some(a => a.userId === user.id);
              if (hasAssignment) {
                const sellRate = getSellRateForDate(task.sellRates, monthStr);
                if (sellRate > 0) {
                  totalRate += sellRate;
                  totalAssignments++;
                }
              }
            });
        });
      }

      // Calculate average rate
      rates.set(user.id, totalAssignments > 0 ? totalRate / totalAssignments : 0);
    });

    return rates;
  }, [users, projects, month]);

  // Calculate cost rates for the forecast month
  const costRates = useMemo(() => {
    const rates = new Map<string, number>();
    
    users.forEach(user => {
      // Get cost rate for the first day of the month using the utility function
      const costRate = getCostRateForMonth(user.costRate || [], month);
      rates.set(user.id, costRate);
    });

    return rates;
  }, [users, month]);

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditData({
      ...editData,
      [user.id]: {
        hoursPerWeek: user.hoursPerWeek || 40,
        estimatedBillablePercentage: user.estimatedBillablePercentage || 0,
        forecastHours: forecasts.find(f => f.userId === user.id)?.hours || 
          (user.hoursPerWeek || 40) * (workingDays / 5)
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId: string) => {
    const userData = editData[userId];
    if (!userData) return;

    const existingForecast = forecasts.find(f => f.userId === userId);

    try {
      if (existingForecast) {
        await onUpdateForecast(existingForecast.id, userData.forecastHours);
      } else {
        await onCreateForecast({
          month,
          userId,
          hours: userData.forecastHours,
          isDefault: false
        });
      }
      
      // TODO: Update user data (hoursPerWeek and billable %) via user service
      
      setHasChanges(true);
      setEditingUserId(null);
    } catch (error) {
      console.error('Error updating forecast:', error);
    }
  };

  const renderUserTable = (users: User[], title: string, isEmployee: boolean) => {
    if (users.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 px-4 py-2 rounded-lg">
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>

        <Table>
          <TableHeader>
            <tr>
              <Th>User</Th>
              <Th className="text-right">Hours/Week</Th>
              <Th className="text-right">Billable %</Th>
              <Th className="text-right">Avg Sell Rate</Th>
              <Th className="text-right">Cost Rate</Th>
              {isEmployee && (
                <>
                  <Th className="text-right">Public Holidays</Th>
                  <Th className="text-right">Planned Leave</Th>
                  <Th className="text-right">Planned Bonuses</Th>
                </>
              )}
              <Th className="text-right">Forecast Hours</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHeader>
          <TableBody>
            {users.map(user => {
              const avgSellRate = historicalRates.get(user.id) || 0;
              const costRate = costRates.get(user.id) || 0;
              const forecast = forecasts.find(f => f.userId === user.id);
              const isEditing = editingUserId === user.id;
              const editingData = editData[user.id];
              
              // Get bonuses for this user in the selected month
              const userBonuses = bonuses.filter(bonus => 
                bonus.employeeId === user.id &&
                format(parseISO(bonus.date), 'yyyy-MM') === month
              );
              const totalBonuses = userBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

              return (
                <tr key={user.id}>
                  <Td className="font-medium">{user.name}</Td>
                  <Td className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="168"
                        value={editingData.hoursPerWeek}
                        onChange={(e) => setEditData({
                          ...editData,
                          [user.id]: {
                            ...editingData,
                            hoursPerWeek: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-24 text-right"
                      />
                    ) : (
                      user.hoursPerWeek || 40
                    )}
                  </Td>
                  <Td className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingData.estimatedBillablePercentage}
                        onChange={(e) => setEditData({
                          ...editData,
                          [user.id]: {
                            ...editingData,
                            estimatedBillablePercentage: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-24 text-right"
                      />
                    ) : (
                      <Badge variant="secondary">
                        {user.estimatedBillablePercentage || 0}%
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-right">{formatCurrency(avgSellRate)}/hr</Td>
                  <Td className="text-right">{formatCurrency(costRate)}/hr</Td>
                  {isEmployee && (
                    <>
                      <Td className="text-right">
                        <Badge variant="secondary">
                          {(holidays.length * 8).toFixed(1)} hrs
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        {(() => {
                          if (!leaveData?.leave) return <Badge variant="secondary">No Data</Badge>;

                          const userLeave = leaveData.leave.filter(leave => 
                            leave.employeeId === user.xeroEmployeeId &&
                            leave.status === 'SCHEDULED'
                          );
                          
                          if (userLeave.length === 0) return <Badge variant="secondary">None</Badge>;
                          
                          const totalHours = userLeave.reduce((sum, leave) => 
                            sum + leave.numberOfUnits, 0
                          );
                          
                          return (
                            <Badge variant="warning">
                              {totalHours.toFixed(1)} hrs
                            </Badge>
                          );
                        })()}
                      </Td>
                      <Td className="text-right text-sm">
                        {totalBonuses > 0 ? (
                          <Badge variant="success">
                            {formatCurrency(totalBonuses)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </Td>
                    </>
                  )}
                  <Td className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editingData.forecastHours}
                        onChange={(e) => setEditData({
                          ...editData,
                          [user.id]: {
                            ...editingData,
                            forecastHours: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-24 text-right"
                      />
                    ) : (
                      <span className={cn(
                        "block text-right",
                        !forecast && "text-gray-400 italic"
                      )}>
                        {(forecast?.hours ?? ((user.hoursPerWeek || 40) * (workingDays / 5))).toFixed(1)}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveEdit(user.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderUserTable(employees, "Employees", true)}
      {renderUserTable(contractors, "Contractors", false)}
    </div>
  );
}