import { useState } from 'react';
import type { Task } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TaskDetail } from './TaskDetail';
import { TaskForm } from './TaskForm';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Clock,
  AlertTriangle,
  Star,
  Pencil,
  Trash2,
  Timer,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
  HIGH: { label: 'High', className: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
  LOW: { label: 'Low', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  NONE: { label: 'None', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
};

function isPastDue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskItem({ task }: TaskItemProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isDone = task.status === 'DONE';
  const pastDue = isPastDue(task.deadline);

  const handleToggleDone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { status: isDone ? 'TODO' : 'DONE' },
      });
      toast.success(isDone ? 'Task reopened' : 'Task completed');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted');
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

  const priority = priorityConfig[task.priority] || priorityConfig.NONE;

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer',
          isDone && 'opacity-60'
        )}
        onClick={() => setDetailOpen(true)}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggleDone}
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium truncate',
                isDone && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            {task.isImportant && (
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
            )}
            {task.isUrgent && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Priority badge */}
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priority.className)}>
              {priority.label}
            </Badge>

            {/* Deadline badge */}
            {task.deadline && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0',
                  pastDue && !isDone
                    ? 'bg-red-500/15 text-red-700 border-red-500/30'
                    : 'text-muted-foreground'
                )}
              >
                {formatDeadline(task.deadline)}
              </Badge>
            )}

            {/* Estimated time */}
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.estimatedMinutes}m
              </span>
            )}

            {/* Category pill */}
            {task.category && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
                style={{
                  backgroundColor: `${task.category.color}20`,
                  color: task.category.color,
                  borderColor: `${task.category.color}40`,
                }}
              >
                {task.category.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleImportant}>
              <Star className="h-4 w-4" />
              {task.isImportant ? 'Unmark Important' : 'Mark Important'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleUrgent}>
              <AlertTriangle className="h-4 w-4" />
              {task.isUrgent ? 'Unmark Urgent' : 'Mark Urgent'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Timer className="h-4 w-4" />
              Start Focus
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Detail Dialog */}
      <TaskDetail task={task} open={detailOpen} onOpenChange={setDetailOpen} />

      {/* Edit Form Dialog */}
      <TaskForm open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
