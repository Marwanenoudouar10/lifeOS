import { useState } from 'react';
import type { Task } from '@lifeos/shared';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, CheckCircle2, Circle, X, Loader2 } from 'lucide-react';

interface SubtaskListProps {
  parentId: string;
  subtasks: Task[];
}

export function SubtaskList({ parentId, subtasks }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await createTask.mutateAsync({
        title: newTitle.trim(),
        parentId,
        status: 'TODO',
        priority: 'NONE',
      });
      setNewTitle('');
      toast.success('Subtask added');
    } catch (err) {
      toast.error('Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (subtask: Task) => {
    const isDone = subtask.status === 'DONE';
    try {
      await updateTask.mutateAsync({
        id: subtask.id,
        data: { status: isDone ? 'TODO' : 'DONE' },
      });
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Subtask removed');
    } catch (err) {
      toast.error('Failed to delete subtask');
    }
  };

  const completedCount = subtasks.filter((s) => s.status === 'DONE').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Subtasks{' '}
          {subtasks.length > 0 && (
            <span className="text-muted-foreground">
              ({completedCount}/{subtasks.length})
            </span>
          )}
        </h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const isDone = subtask.status === 'DONE';
          return (
            <div
              key={subtask.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
            >
              <button
                onClick={() => handleToggleSubtask(subtask)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>

              <span
                className={cn(
                  'flex-1 text-sm',
                  isDone && 'line-through text-muted-foreground'
                )}
              >
                {subtask.title}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add subtask input */}
      {isAdding && (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title..."
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTitle('');
              }
            }}
          />
          <Button type="submit" size="sm" className="h-8" disabled={createTask.isPending}>
            {createTask.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}

      {/* Empty state */}
      {subtasks.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground py-2">No subtasks yet.</p>
      )}
    </div>
  );
}
