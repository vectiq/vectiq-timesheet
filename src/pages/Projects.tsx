import { useState } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit } from 'lucide-react';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Project } from '@/types';

export default function Projects() {
  const { projects, isLoading, createProject, updateProject } = useProjects();
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

  if (isLoading) {
    return <div>Loading...</div>;
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => handleEdit(project)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <h3 className="text-lg font-medium text-gray-900 mb-4">{project.name}</h3>
            
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Budget</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.budget)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Approval Required</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.requiresApproval ? 'Yes' : 'No'}
                </dd>
              </div>

              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-2">Roles</dt>
                <dd className="space-y-2">
                  {project.roles.map(role => (
                    <div key={role.id} className="text-sm">
                      <span className="font-medium">{role.name}</span>
                      <div className="text-gray-500 text-xs">
                        Cost: {formatCurrency(role.costRate)}/hr • 
                        Sell: {formatCurrency(role.sellRate)}/hr
                      </div>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
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