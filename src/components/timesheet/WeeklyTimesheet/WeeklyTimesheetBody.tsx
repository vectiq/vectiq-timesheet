import { useWeeklyTimesheetContext } from './WeeklyTimesheetContext';
import { WeeklyTimesheetRow } from './WeeklyTimesheetRow';

export function WeeklyTimesheetBody() {
  const { rows, setRows, projects } = useWeeklyTimesheetContext();

  const handleProjectSelect = (index: number, projectId: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], projectId, roleId: '' };
    setRows(newRows);
  };

  const handleRoleSelect = (index: number, roleId: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], roleId };
    setRows(newRows);
  };

  const handleHoursChange = (index: number, hours: Record<string, string>) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      hours: Object.entries(hours).reduce((acc, [date, value]) => ({
        ...acc,
        [date]: parseFloat(value) || 0,
      }), {}),
    };
    setRows(newRows);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="divide-y divide-gray-200">
      {rows.map((row, index) => {
        const project = projects.find(p => p.id === row.projectId);
        const role = project?.roles.find(r => r.id === row.roleId);

        return (
          <WeeklyTimesheetRow
            key={index}
            rowIndex={index}
            project={project}
            selectedRole={role}
            projects={projects}
            onProjectSelect={(projectId) => handleProjectSelect(index, projectId)}
            onRoleSelect={(roleId) => handleRoleSelect(index, roleId)}
            onRemove={() => handleRemoveRow(index)}
            onHoursChange={(hours) => handleHoursChange(index, hours)}
          />
        );
      })}
    </div>
  );
}