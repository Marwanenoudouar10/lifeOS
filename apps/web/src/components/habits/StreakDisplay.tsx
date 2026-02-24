'use client';

import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const isAtBest = currentStreak >= longestStreak && longestStreak > 0;
  const percentage = longestStreak > 0
    ? Math.round((currentStreak / longestStreak) * 100)
    : 0;

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            'h-6 w-6',
            currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'
          )}
        />
        <div>
          <p className="text-2xl font-bold leading-none">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Trophy
          className={cn(
            'h-6 w-6',
            isAtBest ? 'text-yellow-500' : 'text-muted-foreground'
          )}
        />
        <div>
          <p className="text-2xl font-bold leading-none">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest</p>
        </div>
      </div>

      {longestStreak > 0 && (
        <>
          <div className="h-8 w-px bg-border" />
          <div>
            <p
              className={cn(
                'text-sm font-medium',
                isAtBest ? 'text-yellow-500' : 'text-muted-foreground'
              )}
            >
              {isAtBest ? 'At your best!' : `${percentage}% of best`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
