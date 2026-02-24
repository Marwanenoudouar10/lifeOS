'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OverloadCheck } from '@lifeos/shared';

interface OverloadWarningProps {
  overloadCheck: OverloadCheck;
}

export function OverloadWarning({ overloadCheck }: OverloadWarningProps) {
  const { totalMinutes, isOverloaded, isHeavy, warning } = overloadCheck;

  if (!isOverloaded && !isHeavy) return null;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const formattedTime = hours > 0
    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    : `${mins}m`;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        isOverloaded
          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50'
          : 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50'
      )}
    >
      <AlertTriangle
        className={cn(
          'h-5 w-5 flex-shrink-0 mt-0.5',
          isOverloaded ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
        )}
      />
      <div>
        <p
          className={cn(
            'text-sm font-medium',
            isOverloaded
              ? 'text-red-800 dark:text-red-200'
              : 'text-yellow-800 dark:text-yellow-200'
          )}
        >
          {isOverloaded ? 'Day Overloaded' : 'Heavy Day'}
        </p>
        <p
          className={cn(
            'text-sm mt-0.5',
            isOverloaded
              ? 'text-red-700 dark:text-red-300'
              : 'text-yellow-700 dark:text-yellow-300'
          )}
        >
          {warning || `Total planned: ${formattedTime}`}
        </p>
        <p
          className={cn(
            'text-xs mt-1',
            isOverloaded
              ? 'text-red-600 dark:text-red-400'
              : 'text-yellow-600 dark:text-yellow-400'
          )}
        >
          Total: {formattedTime} planned
        </p>
      </div>
    </div>
  );
}
