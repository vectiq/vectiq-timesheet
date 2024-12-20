import { useState } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Project } from '@/types';

export default function Projects() {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { confirm, dialog, handleClose } = useConfirm();

  const handleOpenCreateDialog = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Project, 'id'>) => {
    if (selectedProject) {
      await updateProject({ id: selectedProject.id, data });
    } else {
      await createProject(data);
    }
    setIsDialogOpen(false);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This will also remove all associated roles and assignments.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteProject(id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <ProjectsTable 
          projects={projects} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
        onSubmit={handleSubmit}
      />
      
      {dialog && (
        <ConfirmDialog
          open={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </div>
  );
}