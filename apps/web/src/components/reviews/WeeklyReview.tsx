'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Target,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useWeeklyReview,
  useCreateWeeklyReview,
  useGenerateWeeklyReview,
} from '@/hooks/use-reviews';
import { toast } from 'sonner';

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function shiftWeek(weekStart: string, weeks: number): string {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split('T')[0];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}, ${start.getFullYear()}`;
}

interface StringListEditorProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

function StringListEditor({ items, onAdd, onRemove, placeholder }: StringListEditorProps) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="flex-1">{item}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(i)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WeeklyReview() {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const { data: existingReview, isLoading } = useWeeklyReview(weekStart);
  const createReview = useCreateWeeklyReview();
  const generateReview = useGenerateWeeklyReview();

  const [topWins, setTopWins] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [lessonsLearned, setLessonsLearned] = useState<string[]>([]);
  const [nextWeekFocus, setNextWeekFocus] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingReview) {
      setTopWins(existingReview.topWins || []);
      setChallenges(existingReview.challenges || []);
      setLessonsLearned(existingReview.lessonsLearned || []);
      setNextWeekFocus(existingReview.nextWeekFocus || []);
      setNotes(existingReview.notes || '');
    } else {
      setTopWins([]);
      setChallenges([]);
      setLessonsLearned([]);
      setNextWeekFocus([]);
      setNotes('');
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    try {
      await createReview.mutateAsync({
        weekStart,
        topWins: topWins.length > 0 ? topWins : undefined,
        challenges: challenges.length > 0 ? challenges : undefined,
        lessonsLearned: lessonsLearned.length > 0 ? lessonsLearned : undefined,
        nextWeekFocus: nextWeekFocus.length > 0 ? nextWeekFocus : undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Weekly review saved!');
    } catch {
      toast.error('Failed to save review');
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateReview.mutateAsync(weekStart);
      if (result) {
        if (result.topWins) setTopWins(result.topWins);
        if (result.challenges) setChallenges(result.challenges);
        if (result.lessonsLearned) setLessonsLearned(result.lessonsLearned);
        if (result.nextWeekFocus) setNextWeekFocus(result.nextWeekFocus);
        if (result.notes) setNotes(result.notes);
        toast.success('Review auto-generated! Review and edit.');
      }
    } catch {
      toast.error('Failed to generate review');
    }
  };

  const isCurrentWeek = weekStart === getWeekStart();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(shiftWeek(weekStart, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{formatWeekRange(weekStart)}</h2>
            {isCurrentWeek && (
              <Badge variant="secondary" className="text-xs">
                This Week
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(shiftWeek(weekStart, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleGenerate}
          disabled={generateReview.isPending}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generateReview.isPending ? 'Generating...' : 'Auto-Generate'}
        </Button>
      </div>

      {/* Stats */}
      {existingReview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{existingReview.tasksCompleted}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Plus className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{existingReview.tasksCreated}</p>
                <p className="text-xs text-muted-foreground">Tasks Created</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{existingReview.focusMinutes}m</p>
                <p className="text-xs text-muted-foreground">Focus Time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xl font-bold">
                  {existingReview.habitsCompleted}/{existingReview.habitsCompleted + existingReview.habitsMissed}
                </p>
                <p className="text-xs text-muted-foreground">Habits Hit</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Wins */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StringListEditor
            items={topWins}
            onAdd={(item) => setTopWins((prev) => [...prev, item])}
            onRemove={(i) => setTopWins((prev) => prev.filter((_, idx) => idx !== i))}
            placeholder="Add a win..."
          />
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StringListEditor
            items={challenges}
            onAdd={(item) => setChallenges((prev) => [...prev, item])}
            onRemove={(i) => setChallenges((prev) => prev.filter((_, idx) => idx !== i))}
            placeholder="Add a challenge..."
          />
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Lessons Learned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StringListEditor
            items={lessonsLearned}
            onAdd={(item) => setLessonsLearned((prev) => [...prev, item])}
            onRemove={(i) =>
              setLessonsLearned((prev) => prev.filter((_, idx) => idx !== i))
            }
            placeholder="Add a lesson..."
          />
        </CardContent>
      </Card>

      {/* Next Week Focus */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Next Week Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StringListEditor
            items={nextWeekFocus}
            onAdd={(item) => setNextWeekFocus((prev) => [...prev, item])}
            onRemove={(i) =>
              setNextWeekFocus((prev) => prev.filter((_, idx) => idx !== i))
            }
            placeholder="Add a focus area..."
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional reflections on this week..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={createReview.isPending}
        className="w-full"
        size="lg"
      >
        {createReview.isPending ? 'Saving...' : 'Save Weekly Review'}
      </Button>
    </div>
  );
}
