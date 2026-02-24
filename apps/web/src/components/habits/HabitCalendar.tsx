'use client';

import { useMemo } from 'react';
import { useHabitCalendar } from '@/hooks/use-habits';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HabitCalendarProps {
  habitId: string;
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-green-300 dark:bg-green-700';
  return 'bg-green-500 dark:bg-green-500';
}

export function HabitCalendar({ habitId }: HabitCalendarProps) {
  const end = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 89);
  const start = startDate.toISOString().split('T')[0];

  const { data: entries, isLoading, error } = useHabitCalendar(habitId, start, end);

  const { days, months } = useMemo(() => {
    const entryMap = new Map<string, number>();
    if (entries) {
      for (const entry of entries) {
        entryMap.set(entry.date, entry.count || 0);
      }
    }

    const dayList: { date: string; count: number; dayOfWeek: number }[] = [];
    const monthSet = new Map<string, number>();
    const current = new Date(startDate);
    const endDate = new Date();

    let col = 0;
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const monthLabel = current.toLocaleString('default', { month: 'short' });

      if (dayOfWeek === 0 && !monthSet.has(monthLabel)) {
        monthSet.set(monthLabel, col);
      }

      dayList.push({
        date: dateStr,
        count: entryMap.get(dateStr) || 0,
        dayOfWeek,
      });

      if (dayOfWeek === 6) col++;
      current.setDate(current.getDate() + 1);
    }

    return {
      days: dayList,
      months: Array.from(monthSet.entries()).map(([label, colIdx]) => ({
        label,
        colIdx,
      })),
    };
  }, [entries]);

  if (isLoading) {
    return <Skeleton className="h-28 w-full" />;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">Failed to load calendar data.</p>
    );
  }

  // Build grid: 7 rows (days of week) x N columns (weeks)
  const totalWeeks = Math.ceil(days.length / 7) + 1;
  const grid: (typeof days[number] | null)[][] = Array.from(
    { length: 7 },
    () => Array(totalWeeks).fill(null)
  );

  let weekIdx = 0;
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    grid[day.dayOfWeek][weekIdx] = day;
    if (day.dayOfWeek === 6) weekIdx++;
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-0.5 text-xs text-muted-foreground mb-1 ml-6">
        {months.map((m) => (
          <span
            key={m.label}
            style={{ marginLeft: m.colIdx > 0 ? `${m.colIdx * 14}px` : 0 }}
            className="absolute"
          >
            {m.label}
          </span>
        ))}
      </div>
      <TooltipProvider delayDuration={100}>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1">
            <span className="h-[12px]" />
            <span className="h-[12px] leading-[12px]">M</span>
            <span className="h-[12px]" />
            <span className="h-[12px] leading-[12px]">W</span>
            <span className="h-[12px]" />
            <span className="h-[12px] leading-[12px]">F</span>
            <span className="h-[12px]" />
          </div>
          {Array.from({ length: totalWeeks }, (_, wk) => (
            <div key={wk} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, dow) => {
                const cell = grid[dow]?.[wk];
                if (!cell) {
                  return <div key={dow} className="h-[12px] w-[12px]" />;
                }
                return (
                  <Tooltip key={dow}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'h-[12px] w-[12px] rounded-[2px] transition-colors',
                          getIntensityClass(cell.count)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>
                        {cell.date}: {cell.count} check-in{cell.count !== 1 ? 's' : ''}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
