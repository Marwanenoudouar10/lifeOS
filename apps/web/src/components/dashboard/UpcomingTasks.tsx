'use client';

import { CalendarClock, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpcomingTasks } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import type { Task } from '@lifeos/shared';

const priorityConfig: Record<string, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-red-500/10 text-red-600 border-red-200' },
  HIGH: { label: 'High', className: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  LOW: { label: 'Low', className: 'bg-green-500/10 text-green-600 border-green-200' },
  NONE: { label: 'None', className: 'bg-gray-500/10 text-gray-600 border-gray-200' },
};

function formatDeadline(dateStr: string): string {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function deadlineUrgency(dateStr: string): string {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'text-red-600';
  if (diffDays <= 1) return 'text-orange-600';
  if (diffDays <= 3) return 'text-yellow-600';
  return 'text-muted-foreground';
}

export function UpcomingTasks() {
  const { data: raw, isLoading, error } = useUpcomingTasks();
  const tasks = Array.isArray(raw) ? raw : (raw as any)?.tasks || [];

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load upcoming tasks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No upcoming deadlines this week.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.deadline && (
                    <p
                      className={cn(
                        'text-xs',
                        deadlineUrgency(task.deadline)
                      )}
                    >
                      {formatDeadline(task.deadline)}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs flex-shrink-0',
                    priorityConfig[task.priority]?.className
                  )}
                >
                  {priorityConfig[task.priority]?.label || task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
