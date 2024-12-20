import { useState } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { Project } from '@/types';

export default function Projects() {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
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
        <Button onClick={handleCreate}>
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
        onSubmit={selectedProject ? updateProject : createProject}
      />
    </div>
  );
}