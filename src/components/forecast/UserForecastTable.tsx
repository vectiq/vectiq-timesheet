import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/styles';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/currency';
import { format, subMonths, parseISO } from 'date-fns';
import { getSellRateForDate, getCostRateForMonth, getAverageSellRate } from '@/lib/utils/rates';
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
  const [showDebug, setShowDebug] = useState(true);
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

  // Calculate average sell rates for each user based on current assignments
  const averageSellRates = useMemo(() => {
    const monthStart = format(new Date(month + '-01'), 'yyyy-MM-dd');
    return new Map(
      users.map(user => {
        // Get all billable assignments for this user
        const assignments = projects.flatMap(project =>
          project.tasks
            .filter(task => task.billable && task.userAssignments?.some(a => a.userId === user.id))
            .map(task => ({
              projectName: project.name,
              taskName: task.name,
              sellRates: task.sellRates || [],
              effectiveRate: getSellRateForDate(task.sellRates, monthStart)
            }))
        );

        const totalRate = assignments.reduce((sum, a) => sum + a.effectiveRate, 0);
        const avgRate = assignments.length > 0 ? totalRate / assignments.length : 0;

        return [user.id, {
          average: avgRate,
          assignments: assignments
        }];
      })
    );
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
              const avgSellRate = averageSellRates.get(user.id)?.average || 0;
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
      {/* Debug Panel */}
      {showDebug && (
        <Card className="p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Sell Rate Calculations</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDebug(false)}
            >
              Hide Debug
            </Button>
          </div>
          <div className="space-y-4">
            {Array.from(averageSellRates.entries()).map(([userId, data]) => {
              const user = users.find(u => u.id === userId);
              if (!user) return null;
              
              return (
                <div key={userId} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <span className="text-sm font-medium text-indigo-600">
                      Average: ${data.average.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.assignments.map((assignment, i) => (
                      <div key={i} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {assignment.projectName} - {assignment.taskName}
                          </span>
                          <span className="text-gray-900">
                            ${assignment.effectiveRate.toFixed(2)}/hr
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          Historical rates: {assignment.sellRates.length === 0 ? 'None' : 
                            assignment.sellRates
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map(rate => `$${rate.sellRate} (${format(new Date(rate.date), 'MMM d, yyyy')})`)
                              .join(', ')
                          }
                        </div>
                      </div>
                    ))}
                    {data.assignments.length === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        No billable assignments
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {renderUserTable(employees, "Employees", true)}
      {renderUserTable(contractors, "Contractors", false)}
    </div>
  );
}