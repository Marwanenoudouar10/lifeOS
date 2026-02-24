import { useState, useMemo } from 'react';
import type { Task } from '@lifeos/shared';
import { useTasks } from '@/hooks/use-tasks';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Inbox } from 'lucide-react';

interface TaskListProps {
  tasks?: Task[];
  isLoading?: boolean;
  groupBy?: 'status' | 'priority' | 'category' | 'none';
  filters?: Record<string, string>;
}

const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  TODO: 1,
  DEFERRED: 2,
  DONE: 3,
  CANCELLED: 4,
};

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NONE: 4,
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
  DEFERRED: 'Deferred',
};

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NONE: 'None',
};

function groupTasks(
  tasks: Task[],
  groupBy: 'status' | 'priority' | 'category' | 'none'
): { label: string; tasks: Task[] }[] {
  if (groupBy === 'none') {
    return [{ label: '', tasks }];
  }

  const groups = new Map<string, Task[]>();

  for (const task of tasks) {
    let key: string;
    if (groupBy === 'status') {
      key = task.status;
    } else if (groupBy === 'priority') {
      key = task.priority;
    } else {
      key = task.category?.name || 'Uncategorized';
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(task);
  }

  const entries = Array.from(groups.entries()).map(([key, groupTasks]) => {
    let label: string;
    if (groupBy === 'status') {
      label = STATUS_LABELS[key] || key;
    } else if (groupBy === 'priority') {
      label = PRIORITY_LABELS[key] || key;
    } else {
      label = key;
    }
    return { key, label, tasks: groupTasks };
  });

  // Sort groups
  entries.sort((a, b) => {
    if (groupBy === 'status') {
      return (STATUS_ORDER[a.key] ?? 99) - (STATUS_ORDER[b.key] ?? 99);
    }
    if (groupBy === 'priority') {
      return (PRIORITY_ORDER[a.key] ?? 99) - (PRIORITY_ORDER[b.key] ?? 99);
    }
    return a.label.localeCompare(b.label);
  });

  return entries;
}

export function TaskList({ tasks: externalTasks, isLoading: externalLoading, groupBy = 'none', filters }: TaskListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: fetchedTasks, isLoading: fetchLoading } = useTasks(
    externalTasks ? undefined : filters
  );

  const tasks = externalTasks ?? fetchedTasks ?? [];
  const isLoading = externalLoading ?? (externalTasks ? false : fetchLoading);

  const groups = useMemo(() => groupTasks(tasks as Task[], groupBy), [tasks, groupBy]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No tasks yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first task to get started.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
        <TaskForm open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  // Grouped task list
  return (
    <>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label || '__all'}>
            {group.label && (
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {group.tasks.length}
                </span>
              </div>
            )}
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <TaskItem key={task.id} task={task as Task} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <TaskForm open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
