import { useState } from 'react';
import type { Project, UpdateProjectInput, ProjectStatus } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MilestoneList } from './MilestoneList';
import { TaskList } from '../tasks/TaskList';
import { toast } from 'sonner';
import {
  Pencil,
  Trash2,
  Calendar,
  Target,
  Tag,
  Loader2,
  ListTodo,
  X,
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
  ON_HOLD: { label: 'On Hold', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
};

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function ProjectDetail({ project, open, onOpenChange }: ProjectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateProjectInput>({});

  // Fetch the full project data (with milestones, etc.)
  const { data: fullProject } = useProject(project.id);
  const { data: projectTasks, isLoading: tasksLoading } = useTasks({ projectId: project.id });
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const p = (fullProject as Project) || project;
  const status = statusConfig[p.status] || statusConfig.ACTIVE;
  const milestones = p.milestones || [];
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const milestoneProgress =
    milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  const startEdit = () => {
    setEditForm({
      name: p.name,
      description: p.description || '',
      status: p.status,
      color: p.color,
      deadline: p.deadline?.slice(0, 10) || undefined,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editForm.name !== undefined && !editForm.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: p.id,
        data: {
          ...editForm,
          name: editForm.name?.trim(),
          description: editForm.description?.trim() || undefined,
          deadline: editForm.deadline || undefined,
        },
      });
      toast.success('Project updated');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(p.id);
      toast.success('Project deleted');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      await updateProject.mutateAsync({
        id: p.id,
        data: { status: newStatus },
      });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="h-4 w-4 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{p.name}</DialogTitle>
              )}
              <DialogDescription className="mt-1">
                Created {new Date(p.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status Badge / Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <Select
              value={editForm.status || p.status}
              onValueChange={(v) =>
                setEditForm((prev) => ({ ...prev, status: v as ProjectStatus }))
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={p.status} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
              <SelectTrigger className="w-36 border-0 p-0 h-auto shadow-none">
                <Badge variant="outline" className={cn(status.className, 'cursor-pointer')}>
                  {status.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Description */}
        {isEditing ? (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Project description..."
              rows={3}
            />
          </div>
        ) : (
          p.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {p.description}
            </p>
          )
        )}

        {/* Edit fields: Color, Deadline */}
        {isEditing && (
          <>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-all',
                      editForm.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditForm((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={editForm.deadline || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, deadline: e.target.value || undefined }))
                }
              />
            </div>
          </>
        )}

        <Separator />

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {p.deadline && !isEditing && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline: </span>
              <span>
                {new Date(p.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {p.goal && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Goal: </span>
              <span>{p.goal.title}</span>
            </div>
          )}

          {p.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category: </span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
                style={{
                  backgroundColor: `${p.category.color}20`,
                  color: p.category.color,
                }}
              >
                {p.category.name}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tasks: </span>
            <span>{p._count?.tasks ?? projectTasks?.length ?? 0}</span>
          </div>
        </div>

        {/* Milestone progress bar */}
        {milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Milestone Progress</span>
              <span className="font-medium">{milestoneProgress}%</span>
            </div>
            <Progress value={milestoneProgress} />
          </div>
        )}

        <Separator />

        {/* Milestones */}
        <MilestoneList projectId={p.id} milestones={milestones} />

        <Separator />

        {/* Project Tasks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            Tasks
          </h4>
          <TaskList
            tasks={projectTasks as any}
            isLoading={tasksLoading}
            filters={{ projectId: p.id }}
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateProject.isPending}>
                {updateProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
