import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import type { UserForecast } from '@/types/forecasting';

interface UserForecastTableProps {
  userForecasts: UserForecast[];
  onUpdateHours: (userId: string, projectId: string, roleId: string, hours: number) => void;
}

export function UserForecastTable({ userForecasts, onUpdateHours }: UserForecastTableProps) {
  return (
    <Table>
      <TableHeader>
        <tr>
          <Th>User</Th>
          <Th>Project</Th>
          <Th>Role</Th>
          <Th className="text-right">Hours</Th>
        </tr>
      </TableHeader>
      <TableBody>
        {userForecasts.map(user => (
          user.projectAssignments.map((assignment, index) => (
            <tr key={`${user.userId}_${assignment.projectId}_${assignment.roleId}`}>
              {/* Only show user name for first assignment */}
              <Td className={index > 0 ? 'border-l-2 border-transparent' : ''}>
                {index === 0 ? user.userName : ''}
              </Td>
              <Td>{assignment.projectName}</Td>
              <Td>{assignment.roleName}</Td>
              <Td className="text-right">
                <input
                  type="number"
                  value={assignment.forecastedHours}
                  onChange={(e) => {
                    const hours = parseFloat(e.target.value);
                    if (!isNaN(hours) && hours >= 0) {
                      onUpdateHours(user.userId, assignment.projectId, assignment.roleId, hours);
                    }
                  }}
                  className="w-20 text-right rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Td>
            </tr>
          ))
        ))}
      </TableBody>
    </Table>
  );
}