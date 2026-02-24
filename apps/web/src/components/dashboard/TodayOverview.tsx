import { CalendarDays, CheckCircle2, ListTodo, Target, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodayOverview } from '@/hooks/use-analytics';

function formatToday(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function TodayOverview() {
  const { data, isLoading, error } = useTodayOverview();

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load overview.</p>
        </CardContent>
      </Card>
    );
  }

  const tasks = data?.tasks || [];
  const stats = data?.stats || {};
  const activeSession = data?.activeSession;
  const plan = data?.plan;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Today
          </CardTitle>
          <span className="text-sm text-muted-foreground">{formatToday()}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <ListTodo className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-lg font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground">Tasks Due</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-lg font-bold">{stats.tasksCompletedToday ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>

            {activeSession && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Timer className="h-4 w-4 animate-pulse text-primary" />
                <span className="text-sm font-medium">Focus session active</span>
                {activeSession.task?.title && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {activeSession.task.title}
                  </Badge>
                )}
              </div>
            )}

            {plan && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Plan:</span>
                <span>
                  {stats.completedPlanItems ?? 0}/{stats.totalPlanItems ?? 0} items done
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
