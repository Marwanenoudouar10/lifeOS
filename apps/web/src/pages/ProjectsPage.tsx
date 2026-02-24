import { useParams, useNavigate } from 'react-router-dom';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { useProject } from '@/hooks/use-projects';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id || '');

  if (id) {
    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (!project) return <p className="text-muted-foreground">Project not found</p>;
    return <ProjectDetail project={project} open={true} onOpenChange={(open) => { if (!open) navigate('/projects'); }} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>
      <ProjectList />
    </div>
  );
}
