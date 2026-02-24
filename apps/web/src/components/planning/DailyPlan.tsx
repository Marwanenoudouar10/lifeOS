'use client';

import { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Circle,
  Clock,
  Inbox,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlan, useOverloadCheck } from '@/hooks/use-plans';
import { PlanGenerator } from './PlanGenerator';
import { OverloadWarning } from './OverloadWarning';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PlanItem, PlanItemBucket } from '@lifeos/shared';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const BUCKETS: { key: PlanItemBucket; label: string; color: string }[] = [
  { key: 'TOP', label: 'Top Priority', color: 'text-red-600' },
  { key: 'SECONDARY', label: 'Secondary', color: 'text-blue-600' },
  { key: 'OPTIONAL', label: 'Optional', color: 'text-gray-500' },
];

export function DailyPlan({ date: dateProp }: { date?: string } = {}) {
  const [date, setDate] = useState(dateProp || todayString());
  const queryClient = useQueryClient();

  const { data: plan, isLoading, error } = usePlan(date);
  const { data: overload } = useOverloadCheck(date);

  const rollover = useMutation({
    mutationFn: () => planApi.rollover(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', date] });
      toast.success('Incomplete items rolled over');
    },
    onError: () => toast.error('Failed to rollover items'),
  });

  const toggleItem = useMutation({
    mutationFn: ({ itemId, isComplete }: { itemId: string; isComplete: boolean }) =>
      planApi.updateItem(date, itemId, { isComplete }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', date] });
    },
    onError: () => toast.error('Failed to update item'),
  });

  const bucketItems = useMemo(() => {
    const items = plan?.items || [];
    const grouped: Record<PlanItemBucket, PlanItem[]> = {
      TOP: [],
      SECONDARY: [],
      OPTIONAL: [],
    };
    for (const item of items) {
      if (grouped[item.bucket]) {
        grouped[item.bucket].push(item);
      }
    }
    return grouped;
  }, [plan]);

  const isToday = date === todayString();

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(shiftDate(date, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
            {isToday && (
              <Badge variant="secondary" className="text-xs">
                Today
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(shiftDate(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setDate(todayString())}>
            Go to Today
          </Button>
        )}
      </div>

      {/* Overload warning */}
      {overload && <OverloadWarning overloadCheck={overload} />}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <PlanGenerator date={date} />
        <Button
          variant="outline"
          onClick={() => rollover.mutate()}
          disabled={rollover.isPending}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {rollover.isPending ? 'Rolling over...' : 'Rollover'}
        </Button>
      </div>

      {/* Plan content */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load plan.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !plan || plan.items?.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No plan for this day</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a plan or manually add items to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {BUCKETS.map(({ key, label, color }) => {
            const items = bucketItems[key];
            if (items.length === 0) return null;
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className={cn('text-base', color)}>
                    {label}
                    <Badge variant="outline" className="ml-2 text-xs font-normal">
                      {items.filter((i) => i.isComplete).length}/{items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                        >
                          <button
                            onClick={() =>
                              toggleItem.mutate({
                                itemId: item.id,
                                isComplete: !item.isComplete,
                              })
                            }
                            className="flex-shrink-0"
                          >
                            {item.isComplete ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                          <span
                            className={cn(
                              'flex-1 text-sm',
                              item.isComplete && 'line-through text-muted-foreground'
                            )}
                          >
                            {item.task?.title || 'Untitled'}
                          </span>
                          {item.task?.estimatedMinutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.task.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
