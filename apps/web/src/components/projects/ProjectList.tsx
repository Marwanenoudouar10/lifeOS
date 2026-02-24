import { useState } from 'react';
import type { Project, CreateProjectInput, ProjectStatus } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectDetail } from './ProjectDetail';
import { toast } from 'sonner';
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Calendar,
  ListTodo,
  Loader2,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
  ON_HOLD: { label: 'On Hold', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
};

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const status = statusConfig[project.status] || statusConfig.ACTIVE;
  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const milestoneProgress =
    milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <CardTitle className="text-sm font-semibold truncate">
              {project.name}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn('text-[10px] shrink-0', status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Task count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ListTodo className="h-3.5 w-3.5" />
          <span>{project._count?.tasks ?? 0} tasks</span>
        </div>

        {/* Milestone progress */}
        {milestones.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Milestones
              </span>
              <span className="text-muted-foreground">
                {completedMilestones}/{milestones.length}
              </span>
            </div>
            <Progress value={milestoneProgress} className="h-1.5" />
          </div>
        )}

        {/* Deadline */}
        {project.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(project.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: projects, isLoading } = useProjects();
  const { data: goals } = useGoals();
  const createProject = useCreateProject();

  const [form, setForm] = useState<CreateProjectInput>({
    name: '',
    description: '',
    color: '#3b82f6',
    deadline: undefined,
    goalId: undefined,
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      color: '#3b82f6',
      deadline: undefined,
      goalId: undefined,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await createProject.mutateAsync({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        deadline: form.deadline || undefined,
        goalId: form.goalId || undefined,
      });
      toast.success('Project created');
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first project to organize your tasks.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
        {renderCreateDialog()}
      </>
    );
  }

  function renderCreateDialog() {
    return (
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Set up a new project to organize your work.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Name *</Label>
              <Input
                id="projectName"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Project name"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDesc">Description</Label>
              <Textarea
                id="projectDesc"
                value={form.description || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What is this project about?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-all',
                      form.color === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDeadline">Deadline</Label>
              <Input
                id="projectDeadline"
                type="date"
                value={form.deadline || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deadline: e.target.value || undefined }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Linked Goal</Label>
              <Select
                value={form.goalId || 'none'}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, goalId: v === 'none' ? undefined : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  {goals?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects as Project[]).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      </div>

      {renderCreateDialog()}

      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setSelectedProject(null);
          }}
        />
      )}
    </>
  );
}
