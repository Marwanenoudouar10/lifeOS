import { useState } from 'react';
import type { Task } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SubtaskList } from './SubtaskList';
import { TaskForm } from './TaskForm';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  Tag,
  FolderKanban,
  Target,
  Pencil,
  Trash2,
  Timer,
  Zap,
  MapPin,
} from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
  HIGH: { label: 'High', className: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
  LOW: { label: 'Low', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  NONE: { label: 'None', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  TODO: { label: 'To Do', className: 'bg-gray-500/15 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-700' },
  DONE: { label: 'Done', className: 'bg-green-500/15 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-500/15 text-red-700' },
  DEFERRED: { label: 'Deferred', className: 'bg-purple-500/15 text-purple-700' },
};

const contextLabels: Record<string, string> = {
  HOME: 'Home',
  WORK: 'Work',
  ERRANDS: 'Errands',
  COMPUTER: 'Computer',
  PHONE: 'Phone',
  ANYWHERE: 'Anywhere',
};

const energyLabels: Record<string, string> = {
  HIGH: 'High Energy',
  MEDIUM: 'Medium Energy',
  LOW: 'Low Energy',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const priority = priorityConfig[task.priority] || priorityConfig.NONE;
  const status = statusConfig[task.status] || statusConfig.TODO;

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleImportant = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { isImportant: !task.isImportant },
      });
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleToggleUrgent = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { isUrgent: !task.isUrgent },
      });
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const isPastDue =
    task.deadline &&
    task.status !== 'DONE' &&
    new Date(task.deadline) < new Date(new Date().toDateString());

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  Created {formatDate(task.createdAt)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Status & Priority Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            <Badge variant="outline" className={priority.className}>
              {priority.label}
            </Badge>
            {task.isImportant && (
              <Badge variant="outline" className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">
                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                Important
              </Badge>
            )}
            {task.isUrgent && (
              <Badge variant="outline" className="bg-red-500/15 text-red-700 border-red-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className={cn('h-4 w-4', isPastDue ? 'text-red-500' : 'text-muted-foreground')} />
                <div>
                  <span className="text-muted-foreground">Deadline: </span>
                  <span className={cn(isPastDue && 'text-red-600 font-medium')}>
                    {formatDate(task.deadline)}
                  </span>
                </div>
              </div>
            )}

            {/* Scheduled Date */}
            {task.scheduledDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Scheduled: </span>
                  <span>{formatDate(task.scheduledDate)}</span>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {task.estimatedMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Estimated: </span>
                  <span>{task.estimatedMinutes}m</span>
                </div>
              </div>
            )}

            {/* Actual Time */}
            {task.actualMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Actual: </span>
                  <span>{task.actualMinutes}m</span>
                </div>
              </div>
            )}

            {/* Context */}
            {task.context && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Context: </span>
                  <span>{contextLabels[task.context] || task.context}</span>
                </div>
              </div>
            )}

            {/* Energy Level */}
            {task.energyLevel && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Energy: </span>
                  <span>{energyLabels[task.energyLevel] || task.energyLevel}</span>
                </div>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Category: </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: `${task.category.color}20`,
                      color: task.category.color,
                    }}
                  >
                    {task.category.name}
                  </Badge>
                </div>
              </div>
            )}

            {/* Project */}
            {task.project && (
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Project: </span>
                  <span>{task.project.name}</span>
                </div>
              </div>
            )}

            {/* Goal */}
            {task.goal && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Goal: </span>
                  <span>{task.goal.title}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((t) => (
                    <Badge
                      key={t.tag.id}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: `${t.tag.color}20`,
                        color: t.tag.color,
                        borderColor: `${t.tag.color}40`,
                      }}
                    >
                      {t.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subtasks */}
          <Separator />
          <SubtaskList parentId={task.id} subtasks={task.subtasks || []} />

          {/* Notes */}
          {task.notes && (
            <>
              <Separator />
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Timer className="h-4 w-4" />
              Start Focus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleImportant}
            >
              <Star className={cn('h-4 w-4', task.isImportant && 'fill-yellow-500 text-yellow-500')} />
              {task.isImportant ? 'Important' : 'Mark Important'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleUrgent}
            >
              <AlertTriangle className={cn('h-4 w-4', task.isUrgent && 'text-red-500')} />
              {task.isUrgent ? 'Urgent' : 'Mark Urgent'}
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      <TaskForm open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
