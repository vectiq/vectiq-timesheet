import React, { useState } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronRight, Users, AlertCircle, StickyNote, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNotes } from '@/lib/hooks/useNotes';
import { format } from 'date-fns';
import type { ProcessingProject } from '@/types';

interface NoteIndicatorProps {
  projectId: string;
  currentMonth: Date;
}

const NoteIndicator = ({ projectId, currentMonth }: NoteIndicatorProps) => {
  const { notes } = useNotes(projectId, currentMonth);
  
  const pendingActions = notes.filter(note => 
    note.type === 'action' && note.status === 'pending'
  ).length;
  
  const totalNotes = notes.length;
  
  if (pendingActions > 0) {
    return (
      <div className="relative">
        <StickyNote className="h-4 w-4 text-amber-600 animate-pulse" />
        <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-amber-500 rounded-full border-2 border-white" />
      </div>
    );
  }
  
  if (totalNotes > 0) {
    return (
      <div className="relative">
        <StickyNote className="h-4 w-4 text-blue-600" />
        <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white" />
      </div>
    );
  }
  
  return <StickyNote className="h-4 w-4" />;
};

interface ProcessingTableProps {
  projects: ProcessingProject[];
  onUpdateStatus: (args: { projectId: string; status: 'not started' | 'draft' | 'sent' }) => Promise<void>;
  isUpdating: boolean;
  onShowNotes: (projectId: string) => void;
}

export function ProcessingTable({ 
  projects, 
  onUpdateStatus,
  isUpdating,
  onShowNotes
}: ProcessingTableProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const currentMonth = new Date();

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  };

  const handleStatusChange = async (projectId: string, currentStatus: string) => {
    // Cycle through statuses: not started -> draft -> sent
    const statusOrder = ['not started', 'draft', 'sent'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      await onUpdateStatus(
        {
          projectId,
          status: nextStatus as 'not started' | 'draft' | 'sent'
        }
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');      
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <tr>
            <Th className="w-8"></Th>
            <Th>Project</Th>
            <Th>Client</Th>
            <Th className="text-right">Hours</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </TableHeader>
        <TableBody>
          {projects.map(project => {
            const isExpanded = expandedProjects.has(project.id);
            const isLaborHire = project.type === 'labor_hire';

            return (
              <React.Fragment key={project.id}>
                <tr key={project.id} className="border-t border-gray-200">
                  <Td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProject(project.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </Td>
                  <Td className="font-medium">{project.name}</Td>
                  <Td>{project.clientName}</Td>
                  <Td className="text-right">{project.totalHours.toFixed(1)}</Td>
                  <Td>
                    <Badge variant={isLaborHire ? 'default' : 'secondary'}>
                      {isLaborHire ? 'Labor Hire' : 'Team Project'}
                    </Badge>
                  </Td>
                  <Td>
                    {getStatusBadge(project.invoiceStatus)}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => onShowNotes(project.id)}
                        className="mr-2 relative group hover:scale-105 transition-transform duration-200"
                      >
                        <NoteIndicator 
                          projectId={project.id}
                          currentMonth={currentMonth}
                        />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(project.id, project.invoiceStatus)}
                      >
                        Change Status
                      </Button>
                    </div>
                  </Td>
                </tr>

                {isExpanded && (
                  <>
                    <tr className="bg-gray-50">
                      <td></td>
                      <td colSpan={7} className="py-2 px-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <div className="flex items-center gap-4">
                              <Badge variant="success" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.assignments.length} Users
                              </Badge>
                              {project.hasSpecialHandling && (
                                <Badge variant="warning" className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Special Handling
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Table>
                            <TableHeader>
                              <tr className="border-t border-gray-200">
                                <Th>User</Th>
                                <Th>Task</Th>
                                <Th className="text-right">Total Hours</Th>
                                <Th className="text-right">Actions</Th>
                              </tr>
                            </TableHeader>
                            <TableBody>
                              {project.assignments.map(assignment => (
                                <tr key={`${project.id}-${assignment.userId}`}>
                                  <Td className="font-medium">{assignment.userName}</Td>
                                  <Td>{assignment.taskName}</Td>
                                  <Td className="text-right">{assignment.hours.toFixed(1)}</Td>
                                  <Td></Td>
                                </tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}