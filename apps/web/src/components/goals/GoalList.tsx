import { useState } from 'react';
import type { Goal, CreateGoalInput, GoalTimeframe } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useGoals, useCreateGoal } from '@/hooks/use-goals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GoalDetail } from './GoalDetail';
import { GoalProgress } from './GoalProgress';
import { toast } from 'sonner';
import {
  Plus,
  Target,
  Calendar,
  ListTodo,
  FolderKanban,
  Loader2,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Not Started', className: 'bg-gray-500/15 text-gray-700 border-gray-500/30' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
};

const timeframeConfig: Record<string, { label: string; className: string }> = {
  WEEKLY: { label: 'Weekly', className: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30' },
  MONTHLY: { label: 'Monthly', className: 'bg-violet-500/15 text-violet-700 border-violet-500/30' },
  QUARTERLY: { label: 'Quarterly', className: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30' },
  YEARLY: { label: 'Yearly', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  LONG_TERM: { label: 'Long Term', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
};

const TIMEFRAMES: { value: GoalTimeframe; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'LONG_TERM', label: 'Long Term' },
];

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

function GoalCard({
  goal,
  onClick,
}: {
  goal: Goal;
  onClick: () => void;
}) {
  const status = statusConfig[goal.status] || statusConfig.NOT_STARTED;
  const timeframe = timeframeConfig[goal.timeframe] || timeframeConfig.MONTHLY;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: goal.color }}
            />
            <CardTitle className="text-sm font-semibold truncate">
              {goal.title}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn('text-[10px] shrink-0', timeframe.className)}>
            {timeframe.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status badge */}
        <Badge variant="outline" className={cn('text-[10px]', status.className)}>
          {status.label}
        </Badge>

        {/* Progress bar */}
        <GoalProgress goal={goal} showLabel={false} />

        {/* Target date */}
        {goal.targetDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Target:{' '}
              {new Date(goal.targetDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Linked counts */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {goal._count?.tasks !== undefined && (
            <span className="flex items-center gap-1">
              <ListTodo className="h-3.5 w-3.5" />
              {goal._count.tasks} tasks
            </span>
          )}
          {goal._count?.projects !== undefined && (
            <span className="flex items-center gap-1">
              <FolderKanban className="h-3.5 w-3.5" />
              {goal._count.projects} projects
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();

  const [form, setForm] = useState<CreateGoalInput>({
    title: '',
    description: '',
    timeframe: 'MONTHLY',
    targetDate: undefined,
    color: '#3b82f6',
  });

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      timeframe: 'MONTHLY',
      targetDate: undefined,
      color: '#3b82f6',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      await createGoal.mutateAsync({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        targetDate: form.targetDate || undefined,
      });
      toast.success('Goal created');
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailOpen(true);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!goals || goals.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No goals yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Set your first goal to start tracking progress.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Goal
          </Button>
        </div>
        {renderCreateDialog()}
      </>
    );
  }

  function renderCreateDialog() {
    return (
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Goal</DialogTitle>
            <DialogDescription>Define a new goal to work towards.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">Title *</Label>
              <Input
                id="goalTitle"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="What do you want to achieve?"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDesc">Description</Label>
              <Textarea
                id="goalDesc"
                value={form.description || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select
                value={form.timeframe || 'MONTHLY'}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, timeframe: v as GoalTimeframe }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-all',
                      form.color === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalTargetDate">Target Date</Label>
              <Input
                id="goalTargetDate"
                type="date"
                value={form.targetDate || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, targetDate: e.target.value || undefined }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createGoal.isPending}>
                {createGoal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(goals as Goal[]).map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => handleGoalClick(goal)}
            />
          ))}
        </div>
      </div>

      {renderCreateDialog()}

      {selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setSelectedGoal(null);
          }}
        />
      )}
    </>
  );
}
