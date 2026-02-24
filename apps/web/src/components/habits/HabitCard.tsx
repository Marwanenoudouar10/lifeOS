'use client';

import { useState } from 'react';
import { Flame, Check, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useHabitCheckIn, useDeleteHabit } from '@/hooks/use-habits';
import { toast } from 'sonner';
import type { Habit } from '@lifeos/shared';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

const frequencyLabels: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
};

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [isCheckedToday, setIsCheckedToday] = useState(
    habit.lastCheckIn === new Date().toISOString().split('T')[0]
  );
  const checkIn = useHabitCheckIn();
  const deleteHabit = useDeleteHabit();

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync({
        id: habit.id,
        data: { date: new Date().toISOString().split('T')[0], count: 1 },
      });
      setIsCheckedToday(true);
      toast.success('Habit checked in!');
    } catch {
      toast.error('Failed to check in');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit.mutateAsync(habit.id);
      toast.success('Habit deleted');
    } catch {
      toast.error('Failed to delete habit');
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: habit.color }}
      />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{habit.icon || '⭐'}</span>
            <div>
              <h3 className="font-semibold leading-tight">{habit.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {frequencyLabels[habit.frequency] || habit.frequency}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(habit)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {habit.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {habit.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <Flame
              className={cn(
                'h-4 w-4',
                habit.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'
              )}
            />
            <span className="font-medium">{habit.currentStreak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>

          <Button
            size="sm"
            variant={isCheckedToday ? 'secondary' : 'default'}
            disabled={isCheckedToday || checkIn.isPending}
            onClick={handleCheckIn}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            {isCheckedToday ? 'Done' : 'Check In'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
