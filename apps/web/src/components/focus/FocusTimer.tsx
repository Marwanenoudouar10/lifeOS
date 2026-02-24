'use client';

import { cn } from '@/lib/utils';

interface FocusTimerProps {
  seconds: number;
  isPaused: boolean;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FocusTimer({ seconds, isPaused }: FocusTimerProps) {
  // Calculate ring progress: full rotation every 60 seconds
  const progress = (seconds % 60) / 60;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        {/* Progress ring */}
        <circle
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-all duration-1000 ease-linear',
            isPaused ? 'text-yellow-500' : 'text-primary'
          )}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            'text-5xl font-mono font-bold tracking-tight',
            isPaused && 'animate-pulse'
          )}
        >
          {formatTime(seconds)}
        </span>
        {isPaused && (
          <span className="text-sm text-yellow-500 font-medium mt-2">
            Paused
          </span>
        )}
      </div>
    </div>
  );
}
