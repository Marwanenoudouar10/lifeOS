import { useState } from 'react';
import type { Milestone } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { projectApi } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Plus,
  CheckCircle2,
  Circle,
  X,
  Loader2,
  Calendar,
  Trash2,
} from 'lucide-react';

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
}

export function MilestoneList({ projectId, milestones }: MilestoneListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const qc = useQueryClient();

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      await projectApi.addMilestone(projectId, {
        title: newTitle.trim(),
        dueDate: newDueDate || undefined,
      });
      setNewTitle('');
      setNewDueDate('');
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Milestone added');
    } catch (err) {
      toast.error('Failed to add milestone');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    setLoadingIds((prev) => new Set(prev).add(milestone.id));
    try {
      await projectApi.updateMilestone(projectId, milestone.id, {
        isCompleted: !milestone.isCompleted,
      });
      qc.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      toast.error('Failed to update milestone');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(milestone.id);
        return next;
      });
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await projectApi.deleteMilestone(projectId, id);
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Milestone removed');
    } catch (err) {
      toast.error('Failed to delete milestone');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const completedCount = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Milestones{' '}
          {milestones.length > 0 && (
            <span className="text-muted-foreground">
              ({completedCount}/{milestones.length})
            </span>
          )}
        </h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {/* Milestone list */}
      <div className="space-y-1">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
          >
            <button
              onClick={() => handleToggleMilestone(milestone)}
              disabled={loadingIds.has(milestone.id)}
              className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
            >
              {milestone.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-sm',
                  milestone.isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {milestone.title}
              </span>
              {milestone.dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={() => handleDeleteMilestone(milestone.id)}
              disabled={loadingIds.has(milestone.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add milestone form */}
      {isAdding && (
        <form onSubmit={handleAddMilestone} className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Milestone title..."
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDueDate('');
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="h-8 text-sm flex-1"
              placeholder="Due date (optional)"
            />
            <Button type="submit" size="sm" className="h-8" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
                setNewDueDate('');
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {milestones.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground py-2">No milestones yet.</p>
      )}
    </div>
  );
}
