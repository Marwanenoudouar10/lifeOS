'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Trophy,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDailyReview,
  useCreateDailyReview,
  useGenerateDailyReview,
} from '@/hooks/use-reviews';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Mood, EnergyLevel } from '@lifeos/shared';

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'GREAT', emoji: '🤩', label: 'Great' },
  { value: 'GOOD', emoji: '😊', label: 'Good' },
  { value: 'OKAY', emoji: '😐', label: 'Okay' },
  { value: 'BAD', emoji: '😞', label: 'Bad' },
  { value: 'TERRIBLE', emoji: '😫', label: 'Terrible' },
];

const ENERGY_LEVELS: { value: EnergyLevel; label: string; color: string }[] = [
  { value: 'HIGH', label: 'High', color: 'bg-green-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'LOW', label: 'Low', color: 'bg-red-500' },
];

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function DailyReview() {
  const [date, setDate] = useState(todayString());
  const { data: existingReview, isLoading } = useDailyReview(date);
  const createReview = useCreateDailyReview();
  const generateReview = useGenerateDailyReview();

  const [mood, setMood] = useState<Mood | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [wins, setWins] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState('');
  const [notes, setNotes] = useState('');
  const [newWin, setNewWin] = useState('');
  const [newChallenge, setNewChallenge] = useState('');

  // Sync form with existing review data
  useEffect(() => {
    if (existingReview) {
      setMood(existingReview.mood);
      setEnergyLevel(existingReview.energyLevel);
      setWins(existingReview.wins || []);
      setChallenges(existingReview.challenges || []);
      setGratitude(existingReview.gratitude || '');
      setNotes(existingReview.notes || '');
    } else {
      setMood(null);
      setEnergyLevel(null);
      setWins([]);
      setChallenges([]);
      setGratitude('');
      setNotes('');
    }
  }, [existingReview]);

  const addWin = () => {
    if (newWin.trim()) {
      setWins((prev) => [...prev, newWin.trim()]);
      setNewWin('');
    }
  };

  const removeWin = (index: number) => {
    setWins((prev) => prev.filter((_, i) => i !== index));
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      setChallenges((prev) => [...prev, newChallenge.trim()]);
      setNewChallenge('');
    }
  };

  const removeChallenge = (index: number) => {
    setChallenges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await createReview.mutateAsync({
        date,
        mood: mood || undefined,
        energyLevel: energyLevel || undefined,
        wins: wins.length > 0 ? wins : undefined,
        challenges: challenges.length > 0 ? challenges : undefined,
        gratitude: gratitude.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Daily review saved!');
    } catch {
      toast.error('Failed to save review');
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateReview.mutateAsync(date);
      if (result) {
        if (result.wins) setWins(result.wins);
        if (result.challenges) setChallenges(result.challenges);
        if (result.notes) setNotes(result.notes);
        if (result.gratitude) setGratitude(result.gratitude);
        toast.success('Review auto-generated! Review and edit as needed.');
      }
    } catch {
      toast.error('Failed to generate review');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
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
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {existingReview.tasksCompleted}/{existingReview.tasksPlanned}
                </p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{existingReview.focusMinutes}m</p>
                <p className="text-xs text-muted-foreground">Focus Time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-3xl">
                {MOODS.find((m) => m.value === existingReview.mood)?.emoji || '---'}
              </span>
              <div>
                <p className="text-sm font-medium">
                  {MOODS.find((m) => m.value === existingReview.mood)?.label || 'Not set'}
                </p>
                <p className="text-xs text-muted-foreground">Mood</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How was your day?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all hover:scale-105',
                  mood === m.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-transparent hover:border-muted-foreground/30'
                )}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Energy Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {ENERGY_LEVELS.map((e) => (
              <Button
                key={e.value}
                variant={energyLevel === e.value ? 'default' : 'outline'}
                onClick={() => setEnergyLevel(e.value)}
                className="flex-1 gap-2"
              >
                <div className={cn('h-3 w-3 rounded-full', e.color)} />
                {e.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wins */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {wins.map((win, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{win}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeWin(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a win..."
                value={newWin}
                onChange={(e) => setNewWin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addWin()}
              />
              <Button variant="outline" size="icon" onClick={addWin}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
          <div className="space-y-2">
            {challenges.map((challenge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{challenge}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeChallenge(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a challenge..."
                value={newChallenge}
                onChange={(e) => setNewChallenge(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
              />
              <Button variant="outline" size="icon" onClick={addChallenge}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gratitude */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            Gratitude
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What are you grateful for today?"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            rows={2}
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
            placeholder="Any additional thoughts or reflections..."
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
        {createReview.isPending ? 'Saving...' : 'Save Daily Review'}
      </Button>
    </div>
  );
}
