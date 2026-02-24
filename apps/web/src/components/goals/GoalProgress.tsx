import type { Goal } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target } from 'lucide-react';

interface GoalProgressProps {
  goal: Goal;
  showLabel?: boolean;
  className?: string;
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-blue-600';
  if (progress >= 25) return 'text-yellow-600';
  return 'text-muted-foreground';
}

export function GoalProgress({ goal, showLabel = true, className }: GoalProgressProps) {
  const progress = Math.min(100, Math.max(0, goal.progress));

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            Progress
          </span>
          <span className={cn('text-sm font-semibold', getProgressColor(progress))}>
            {progress}%
          </span>
        </div>
      )}

      <Progress value={progress} className="h-2" />

      {!showLabel && (
        <div className="flex items-center justify-end">
          <span className={cn('text-xs font-medium', getProgressColor(progress))}>
            {progress}%
          </span>
        </div>
      )}

      {progress >= 100 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Goal achieved!</span>
        </div>
      )}
    </div>
  );
}
