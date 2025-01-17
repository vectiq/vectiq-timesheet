import React, { useState } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronRight, Users, AlertCircle, StickyNote, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { NotesSlideout } from './NotesSlideout';
import { useProcessingNotes } from '@/lib/hooks/useProcessingNotes';
import type { ProcessingProject } from '@/types';

interface ProcessingTableProps {
  projects: ProcessingProject[];
  onUpdateStatus: (args: { projectId: string; status: 'not started' | 'draft' | 'sent' }) => Promise<void>;
  isUpdating: boolean;
  month: string;
}

export function ProcessingTable({ 
  projects, 
  onUpdateStatus,
  isUpdating,
  month
}: ProcessingTableProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProcessingProject | null>(null);

  // Create a map to store notes for each project
  const notesMap = new Map();
  
  // Fetch notes for all projects
  projects.forEach(project => {
    const {
      projectNotes,
      addProjectNote,
      updateProjectNote,
      deleteProjectNote,
      isLoadingProjectNotes
    } = useProcessingNotes({
      projectId: project.id,
      month
    });
    
    notesMap.set(project.id, {
      notes: projectNotes,
      addNote: addProjectNote,
      updateNote: updateProjectNote,
      deleteNote: deleteProjectNote,
      isLoading: isLoadingProjectNotes
    });
  });

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
            <Th>Timesheet Approval</Th>
            <Th>Processing Status</Th>
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
                    {project.requiresApproval ? (
                      <Badge
                        variant={
                          project.assignments.every(a => a.approvalStatus === 'approved') ? 'success' :
                          project.assignments.some(a => a.approvalStatus === 'pending') ? 'warning' :
                          'default'
                        }
                      >
                        {project.assignments.every(a => a.approvalStatus === 'approved') ? 'All Approved' :
                         project.assignments.some(a => a.approvalStatus === 'pending') ? 'Pending Approval' :
                         'Not Submitted'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Approval Required</Badge>
                    )}
                  </Td>
                  <Td>
                    {getStatusBadge(project.invoiceStatus)}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="relative"
                        title="View project notes"
                        onClick={() => {
                          setSelectedProject(project);
                          setNotesOpen(true);
                        }}
                      >
                        <StickyNote className="h-4 w-4" />
                        {notesMap.get(project.id)?.notes.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 flex items-center justify-center text-xs"
                          >
                            {notesMap.get(project.id)?.notes.length}
                          </Badge>
                        )}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={isUpdating}
                        title="Toggle processing status"
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
                          <Table>
                            <TableHeader>
                              <tr className="border-t border-gray-200">
                                <Th>Staff Member</Th>
                                <Th>Task</Th>
                                <Th>Timesheet Status</Th>
                                <Th className="text-right">Total Hours</Th>
                              </tr>
                            </TableHeader>
                            <TableBody>
                              {project.assignments.map(assignment => (
                                <tr key={`${project.id}-${assignment.userId}`}>
                                  <Td className="font-medium">{assignment.userName}</Td>
                                  <Td>{assignment.taskName}</Td>
                                  <Td>
                                    {project.requiresApproval ? (
                                      <Badge
                                        variant={
                                          assignment.approvalStatus === 'approved' ? 'success' :
                                          assignment.approvalStatus === 'pending' ? 'warning' :
                                          assignment.approvalStatus === 'rejected' ? 'destructive' :
                                          'default'
                                        }
                                      >
                                        {assignment.approvalStatus === 'approved' ? 'Approved' :
                                         assignment.approvalStatus === 'pending' ? 'Pending Approval' :
                                         assignment.approvalStatus === 'rejected' ? 'Rejected' :
                                         'Not Submitted'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">No Approval Required</Badge>
                                    )}
                                  </Td>
                                  <Td className="text-right">{assignment.hours.toFixed(1)}</Td>
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
      
      {selectedProject && (
        <NotesSlideout
          open={notesOpen}
          onClose={() => {
            setNotesOpen(false);
            setSelectedProject(null);
          }}
          title={`Notes for ${selectedProject.name}`}
          notes={notesMap.get(selectedProject.id)?.notes || []}
          onAddNote={(note) => notesMap.get(selectedProject.id)?.addNote(note)}
          onUpdateNote={(noteId, updates) => notesMap.get(selectedProject.id)?.updateNote(noteId, updates)}
          onDeleteNote={(noteId) => notesMap.get(selectedProject.id)?.deleteNote(noteId)}
          isLoading={notesMap.get(selectedProject.id)?.isLoading}
        />
      )}
    </div>
  );
}