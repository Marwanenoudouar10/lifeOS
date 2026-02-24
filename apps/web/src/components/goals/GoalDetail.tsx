import { useState } from 'react';
import type { Goal, UpdateGoalInput, GoalStatus, GoalTimeframe } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GoalProgress } from './GoalProgress';
import { TaskList } from '../tasks/TaskList';
import { toast } from 'sonner';
import {
  Pencil,
  Trash2,
  Calendar,
  FolderKanban,
  ListTodo,
  Loader2,
  X,
} from 'lucide-react';

interface GoalDetailProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Not Started', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
};

const timeframeLabels: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
  LONG_TERM: 'Long Term',
};

const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

const TIMEFRAMES: { value: GoalTimeframe; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'LONG_TERM', label: 'Long Term' },
];

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function GoalDetail({ goal, open, onOpenChange }: GoalDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateGoalInput>({});

  const { data: fullGoal } = useGoal(goal.id);
  const { data: goalTasks, isLoading: tasksLoading } = useTasks({ goalId: goal.id });
  const { data: allProjects } = useProjects();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const g = (fullGoal as Goal) || goal;
  const status = statusConfig[g.status] || statusConfig.NOT_STARTED;

  // Filter projects linked to this goal
  const linkedProjects = (allProjects || []).filter((p: any) => p.goalId === g.id);

  const startEdit = () => {
    setEditForm({
      title: g.title,
      description: g.description || '',
      status: g.status,
      timeframe: g.timeframe,
      targetDate: g.targetDate?.slice(0, 10) || undefined,
      color: g.color,
      progress: g.progress,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editForm.title !== undefined && !editForm.title.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      await updateGoal.mutateAsync({
        id: g.id,
        data: {
          ...editForm,
          title: editForm.title?.trim(),
          description: editForm.description?.trim() || undefined,
          targetDate: editForm.targetDate || undefined,
        },
      });
      toast.success('Goal updated');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(g.id);
      toast.success('Goal deleted');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  const handleStatusChange = async (newStatus: GoalStatus) => {
    try {
      await updateGoal.mutateAsync({
        id: g.id,
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
              style={{ backgroundColor: g.color }}
            />
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{g.title}</DialogTitle>
              )}
              <DialogDescription className="mt-1">
                Created {new Date(g.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status & Timeframe */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Select
                value={editForm.status || g.status}
                onValueChange={(v) =>
                  setEditForm((prev) => ({ ...prev, status: v as GoalStatus }))
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
              <Select
                value={editForm.timeframe || g.timeframe}
                onValueChange={(v) =>
                  setEditForm((prev) => ({ ...prev, timeframe: v as GoalTimeframe }))
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Select value={g.status} onValueChange={(v) => handleStatusChange(v as GoalStatus)}>
                <SelectTrigger className="w-auto border-0 p-0 h-auto shadow-none">
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
              <Badge variant="secondary">
                {timeframeLabels[g.timeframe] || g.timeframe}
              </Badge>
            </>
          )}
        </div>

        {/* Progress */}
        <GoalProgress goal={g} />

        {/* Edit progress slider */}
        {isEditing && (
          <div className="space-y-2">
            <Label>Progress ({editForm.progress ?? g.progress}%)</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={editForm.progress ?? g.progress}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, progress: parseInt(e.target.value, 10) }))
              }
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Description */}
        {isEditing ? (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Goal description..."
              rows={3}
            />
          </div>
        ) : (
          g.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {g.description}
            </p>
          )
        )}

        {/* Edit fields: Color, Target Date */}
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
              <Label>Target Date</Label>
              <Input
                type="date"
                value={editForm.targetDate || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, targetDate: e.target.value || undefined }))
                }
              />
            </div>
          </>
        )}

        <Separator />

        {/* Details */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {g.targetDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Target: </span>
                <span>
                  {new Date(g.targetDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tasks: </span>
              <span>{g._count?.tasks ?? goalTasks?.length ?? 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Projects: </span>
              <span>{g._count?.projects ?? linkedProjects.length}</span>
            </div>
          </div>
        )}

        {/* Linked Projects */}
        {linkedProjects.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <FolderKanban className="h-4 w-4" />
                Linked Projects
              </h4>
              <div className="space-y-1">
                {linkedProjects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-sm flex-1">{proj.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        statusConfig[proj.status as string]?.className
                      )}
                    >
                      {statusConfig[proj.status as string]?.label || proj.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Linked Tasks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            Linked Tasks
          </h4>
          <TaskList
            tasks={goalTasks as any}
            isLoading={tasksLoading}
            filters={{ goalId: g.id }}
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateGoal.isPending}>
                {updateGoal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
