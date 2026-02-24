import type { Task } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useEisenhowerMatrix } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Flame,
  CalendarClock,
  Users,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface EisenhowerData {
  doFirst: Task[];
  schedule: Task[];
  delegate: Task[];
  eliminate: Task[];
}

interface QuadrantConfig {
  key: keyof EisenhowerData;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  headerClass: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    key: 'doFirst',
    title: 'Do First',
    subtitle: 'Important & Urgent',
    icon: Flame,
    bgClass: 'bg-red-500/5',
    borderClass: 'border-red-500/20',
    iconClass: 'text-red-600',
    headerClass: 'text-red-700',
  },
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Important & Not Urgent',
    icon: CalendarClock,
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/20',
    iconClass: 'text-blue-600',
    headerClass: 'text-blue-700',
  },
  {
    key: 'delegate',
    title: 'Delegate',
    subtitle: 'Not Important & Urgent',
    icon: Users,
    bgClass: 'bg-yellow-500/5',
    borderClass: 'border-yellow-500/20',
    iconClass: 'text-yellow-600',
    headerClass: 'text-yellow-700',
  },
  {
    key: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Important & Not Urgent',
    icon: Trash2,
    bgClass: 'bg-gray-500/5',
    borderClass: 'border-gray-500/20',
    iconClass: 'text-gray-500',
    headerClass: 'text-gray-600',
  },
];

const priorityDots: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
  NONE: 'bg-gray-400',
};

function QuadrantCard({
  config,
  tasks,
}: {
  config: QuadrantConfig;
  tasks: Task[];
}) {
  const Icon = config.icon;

  return (
    <Card className={cn('flex flex-col', config.bgClass, config.borderClass)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.iconClass)} />
          <CardTitle className={cn('text-sm font-semibold', config.headerClass)}>
            {config.title}
          </CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {tasks.length}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">{config.subtitle}</p>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">No tasks</p>
        ) : (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-background/60 transition-colors"
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 rounded-full shrink-0',
                    priorityDots[task.priority] || 'bg-gray-400'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  {task.deadline && (
                    <p className="text-[10px] text-muted-foreground">
                      Due{' '}
                      {new Date(task.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function EisenhowerMatrix() {
  const { data, isLoading, error } = useEisenhowerMatrix();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">Failed to load Eisenhower Matrix</p>
        </div>
      </Card>
    );
  }

  const matrix: EisenhowerData = data || {
    doFirst: [],
    schedule: [],
    delegate: [],
    eliminate: [],
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {QUADRANTS.map((quadrant) => (
        <QuadrantCard
          key={quadrant.key}
          config={quadrant}
          tasks={matrix[quadrant.key] || []}
        />
      ))}
    </div>
  );
}
