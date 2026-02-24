'use client';

import { RotateCcw, Check, Minus, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabits } from '@/hooks/use-habits';
import { cn } from '@/lib/utils';
import type { Habit } from '@lifeos/shared';

function isTodayCheckedIn(habit: Habit): boolean {
  if (!habit.lastCheckIn) return false;
  const today = new Date().toISOString().split('T')[0];
  const checkIn = new Date(habit.lastCheckIn).toISOString().split('T')[0];
  return checkIn === today;
}

export function RoutinesStatus() {
  const { data: habits, isLoading, error } = useHabits();

  // Filter to active daily/weekly habits
  const activeHabits = habits?.filter((h: Habit) => h.isActive) || [];

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load routines.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Today's Routines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : activeHabits.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No active habits to track.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeHabits.map((habit: Habit) => {
              const completed = isTodayCheckedIn(habit);
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 rounded-md p-2"
                >
                  <span className="text-lg flex-shrink-0">
                    {habit.icon || '⭐'}
                  </span>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      completed && 'text-muted-foreground'
                    )}
                  >
                    {habit.name}
                  </span>
                  {completed ? (
                    <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-200">
                      <Check className="h-3 w-3" />
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Minus className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
