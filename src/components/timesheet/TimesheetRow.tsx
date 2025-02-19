import { memo, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Td } from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EditableTimeCell } from "./EditableTimeCell";
import { cn } from "@/lib/utils/styles";
import { X, Lock } from "lucide-react";
import { useApprovals } from "@/lib/hooks/useApprovals";
import { useProjects } from "@/lib/hooks/useProjects";
import { useClients } from "@/lib/hooks/useClients";
import type { TimeEntry } from "@/types";

interface TimesheetRowProps {
  index: number;
  row: {
    clientId: string;
    projectId: string;
    taskId: string;
  };
  weekKey: string;
  weekDays: Date[];
  timeEntries: TimeEntry[];
  getProjectsForClient: (clientId: string) => Project[];
  getTasksForProject: (projectId: string) => ProjectTask[];
  editingCell: string | null;
  onUpdateRow: (index: number, updates: any) => void;
  onRemoveRow: (index: number) => void;
  onCellChange: (date: string, row: any, value: number | null) => void;
  onStartEdit: (key: string) => void;
  onEndEdit: () => void;
  onTabBetweenCells: (currentDate: string, shiftKey: boolean) => void;
  userId: string;
  committingCell: string | null;
  availableAssignments: Array<{
    isActive: boolean;
    clientId: string;
    projectId: string;
    taskId: string;
    projectName: string;
    taskName: string;
  }>;
}

export const TimesheetRow = memo(function TimesheetRow({
  index,
  row,
  weekKey,
  weekDays,
  timeEntries,
  getProjectsForClient,
  getTasksForProject,
  editingCell,
  onUpdateRow,
  onRemoveRow,
  onCellChange,
  onStartEdit,
  onEndEdit,
  onTabBetweenCells,
  committingCell,
  userId,
  availableAssignments,
}: TimesheetRowProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { approvals } = useApprovals();

  // Get available projects for selected client
  const availableProjects = useMemo(() => {
    if (!row.clientId) return [];
    // Get all projects for the client, including inactive ones
    return getProjectsForClient(row.clientId);
  }, [row.clientId, getProjectsForClient, availableAssignments]);

  // Get available tasks for selected project
  const availableTasks = useMemo(() => {
    if (!row.projectId) return [];
    // Get all tasks for the project, including inactive ones
    return getTasksForProject(row.projectId).map((t) => ({
      ...t,
      isActive:
        availableAssignments.find(
          (a) => a.projectId === row.projectId && a.taskId === t.id
        )?.isActive ?? true,
    }));
  }, [row.projectId, getTasksForProject, availableAssignments]);

  // Check if current row combination is inactive
  const isInactiveAssignment = useMemo(() => {
    if (!row.clientId || !row.projectId || !row.taskId) return false;

    const assignment = availableAssignments.find(
      (a) =>
        a.clientId === row.clientId &&
        a.projectId === row.projectId &&
        a.taskId === row.taskId
    );

    return assignment && !assignment.isActive;
  }, [row, availableAssignments]);

  // Get available clients and projects based on user assignments
  const availableClients = useMemo(() => {
    if (!userId || !projects) return [];
    return clients;
  }, [availableAssignments, clients]);

  // Auto-select client if there's only one option
  useEffect(() => {
    if (availableClients.length === 1 && !row.clientId) {
      onUpdateRow(index, {
        clientId: availableClients[0].id,
        projectId: "",
        taskId: "",
      });
    }
  }, [availableClients, row.clientId, index, onUpdateRow]);

  // Auto-select project if there's only one option
  useEffect(() => {
    if (availableProjects.length === 1 && row.clientId && !row.projectId) {
      onUpdateRow(index, {
        projectId: availableProjects[0].id,
        taskId: "",
      });
    }
  }, [availableProjects, row.clientId, row.projectId, index, onUpdateRow]);

  // Auto-select task if there's only one option
  useEffect(() => {
    if (availableTasks.length === 1 && row.projectId && !row.taskId) {
      onUpdateRow(index, {
        taskId: availableTasks[0].id,
      });
    }
  }, [availableTasks, row.projectId, row.taskId, index, onUpdateRow]);

  // Get row entries
  const rowEntries =
    !row.clientId || !row.projectId || !row.taskId
      ? []
      : timeEntries.filter(
          (entry) =>
            entry.clientId === row.clientId &&
            entry.projectId === row.projectId &&
            entry.taskId === row.taskId
        );

  // Calculate row total
  const rowTotal = rowEntries.reduce((sum, entry) => sum + entry.hours, 0);

  // Get all approvals for this project
  const projectApprovals = approvals.filter(
    (approval) =>
      approval.project?.id === row.projectId &&
      (approval.status === "pending" || approval.status === "approved")
  );

  // Check if each date is locked by an approval
  const weekApprovals = weekDays.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return projectApprovals.find(
      (approval) => dateStr >= approval.startDate && dateStr <= approval.endDate
    );
  });

  // Check if the entire row is locked
  const hasLockedEntries = weekApprovals?.some(
    (approval) =>
      approval?.status === "pending" || approval?.status === "approved"
  );

  // Check if the task is inactive
  const isTaskInactive = useMemo(() => {
    if (!row.clientId || !row.projectId || !row.taskId) return false;
    const activeTask = availableTasks.find(
      (t) => t.id === row.taskId && t.isActive
    );

    const assignment =
      activeTask !== undefined
        ? availableAssignments.find(
            (a) =>
              a.clientId === row.clientId &&
              a.projectId === row.projectId &&
              a.taskId === row.taskId
          )
        : undefined;

    return !(assignment !== undefined && assignment.isActive);
  }, [row, availableAssignments, availableTasks]);

  return (
    <tr>
      <Td>
        <Select
          value={row.clientId}
          onValueChange={(value) =>
            onUpdateRow(index, {
              clientId: value,
              projectId: "",
              taskId: "",
            })
          }
          disabled={hasLockedEntries || isTaskInactive}
        >
          <SelectTrigger
            className={cn(
              (hasLockedEntries || isTaskInactive) &&
                "cursor-not-allowed bg-gray-50"
            )}
            title={
              hasLockedEntries
                ? "Cannot modify row with pending or approved entries"
                : isTaskInactive
                ? "Cannot modify row with inactive task"
                : undefined
            }
          >
            {row.clientId
              ? availableClients.find((c) => c.id === row.clientId)?.name
              : "Select Client"}
          </SelectTrigger>
          <SelectContent>
            {availableClients
              .filter((client) =>
                availableAssignments.some((a) => a.clientId === client.id)
              )
              .map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </Td>
      <Td>
        <Select
          value={row.projectId}
          onValueChange={(value) =>
            onUpdateRow(index, {
              projectId: value,
              taskId: "",
            })
          }
          disabled={!row.clientId || hasLockedEntries || isTaskInactive}
        >
          <SelectTrigger
            className={cn(
              (hasLockedEntries || isTaskInactive) &&
                "cursor-not-allowed bg-gray-50"
            )}
            title={
              hasLockedEntries
                ? "Cannot modify row with pending or approved entries"
                : isTaskInactive
                ? "Cannot modify row with inactive task"
                : undefined
            }
          >
            {row.projectId ? (
              <div className="flex items-center gap-2">
                <span>
                  {availableProjects.find((p) => p.id === row.projectId)?.name}
                </span>
                {!availableProjects.find((p) => p.id === row.projectId)
                  ?.isActive && (
                  <span className="text-xs text-red-500">(Inactive)</span>
                )}
              </div>
            ) : (
              "Select Project"
            )}
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                disabled={!project.isActive || isTaskInactive}
                className={
                  !project.isActive || isTaskInactive
                    ? "cursor-not-allowed"
                    : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span>{project.name}</span>
                  {!project.isActive && (
                    <span className="text-xs text-red-500">(Inactive)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Td>
      <Td>
        <Select
          value={row.taskId}
          onValueChange={(value) =>
            onUpdateRow(index, {
              taskId: value,
            })
          }
          disabled={!row.projectId || hasLockedEntries || isTaskInactive}
        >
          <SelectTrigger
            className={cn(
              (hasLockedEntries || isTaskInactive) &&
                "cursor-not-allowed bg-gray-50"
            )}
            title={
              hasLockedEntries
                ? "Cannot modify row with pending or approved entries"
                : isTaskInactive
                ? "Cannot modify row with inactive task"
                : undefined
            }
          >
            {row.taskId ? (
              <div className="flex items-center gap-2">
                <span>
                  {availableTasks.find((t) => t.id === row.taskId)?.name}
                </span>
                {!availableTasks.find((t) => t.id === row.taskId)?.isActive && (
                  <span className="text-xs text-red-500">(Inactive)</span>
                )}
              </div>
            ) : (
              "Select Task"
            )}
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map((task) => (
              <SelectItem
                key={task.id}
                value={task.id}
                disabled={!task.isActive || isTaskInactive}
                className={cn(
                  (!task.isActive || isTaskInactive) && "cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{task.name}</span>
                  {!task.isActive && (
                    <span className="text-xs text-red-500">(Inactive)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Td>
      {weekDays.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const entry = rowEntries.find((e) => e.date === dateStr);
        const cellKey = `${dateStr}-${row.projectId}-${row.taskId}`;
        const isRowComplete = row.clientId && row.projectId && row.taskId;
        const isLocked =
          weekApprovals[weekDays.indexOf(date)]?.status === "pending" ||
          weekApprovals[weekDays.indexOf(date)]?.status === "approved";

        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={entry?.hours || null}
              onChange={(value) => onCellChange(dateStr, row, value)}
              isEditing={editingCell === cellKey && !isInactiveAssignment}
              onStartEdit={() => onStartEdit(cellKey)}
              onEndEdit={onEndEdit}
              onTab={(shift) => onTabBetweenCells(dateStr, shift)}
              isCommitting={committingCell === cellKey}
              isDisabled={!isRowComplete || isInactiveAssignment}
              isLocked={isLocked}
              tooltip={
                isInactiveAssignment
                  ? "Cannot add time entries for inactive assignments"
                  : undefined
              }
              cellKey={cellKey}
            />
          </Td>
        );
      })}
      <Td className="text-center font-medium">{rowTotal.toFixed(2)}</Td>
      <Td>
        <Button
          variant="secondary"
          size="sm"
          disabled={hasLockedEntries || isTaskInactive}
          title={
            hasLockedEntries
              ? "Cannot delete row with locked entries"
              : isTaskInactive
              ? "Cannot delete row with inactive task"
              : undefined
          }
          onClick={() => onRemoveRow(index)}
          className={cn(
            (hasLockedEntries || isTaskInactive) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          {hasLockedEntries || isTaskInactive ? (
            <Lock className="h-4 w-4 text-gray-400" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </Td>
    </tr>
  );
});

TimesheetRow.displayName = "TimesheetRow";
