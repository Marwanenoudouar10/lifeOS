'use client';

import { useState } from 'react';
import { Play, Pause, Square, Target, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTimer } from '@/hooks/use-timer';
import { useTasks } from '@/hooks/use-tasks';
import { FocusTimer } from './FocusTimer';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@lifeos/shared';

export function FocusMode() {
  const timer = useTimer();
  const { data: tasks } = useTasks({ status: 'TODO' });
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleStart = async () => {
    try {
      await timer.start(
        selectedTaskId || undefined,
        selectedTaskTitle || undefined
      );
      toast.success('Focus session started');
    } catch {
      toast.error('Failed to start focus session');
    }
  };

  const handlePause = async () => {
    try {
      await timer.pause();
    } catch {
      toast.error('Failed to pause session');
    }
  };

  const handleResume = async () => {
    try {
      await timer.resume();
    } catch {
      toast.error('Failed to resume session');
    }
  };

  const handleComplete = async () => {
    try {
      await timer.complete(notes || undefined);
      setNotes('');
      setSelectedTaskId('');
      setSelectedTaskTitle('');
      toast.success('Focus session completed!');
    } catch {
      toast.error('Failed to complete session');
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = tasks?.find((t: Task) => t.id === taskId);
    if (task) {
      setSelectedTaskTitle(task.title);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <AnimatePresence mode="wait">
        {!timer.isActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 max-w-md w-full"
          >
            <div className="text-center">
              <Target className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Start Focus Session</h2>
              <p className="text-muted-foreground mt-2">
                Eliminate distractions and focus on what matters.
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label>Link to a task (optional)</Label>
                <Select value={selectedTaskId || 'none'} onValueChange={(v) => handleTaskSelect(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task</SelectItem>
                    {tasks?.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                onClick={handleStart}
                className="w-full gap-2 text-lg h-14"
              >
                <Play className="h-5 w-5" />
                Start Focus
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 max-w-md w-full"
          >
            {timer.taskTitle && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Focusing on</p>
                <p className="text-lg font-semibold">{timer.taskTitle}</p>
              </div>
            )}

            <FocusTimer seconds={timer.elapsedSeconds} isPaused={timer.isPaused} />

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="focus-notes" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Session Notes
                </Label>
                <Textarea
                  id="focus-notes"
                  placeholder="Capture thoughts, progress..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 w-full">
                {timer.isPaused ? (
                  <Button
                    size="lg"
                    onClick={handleResume}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handlePause}
                    className="flex-1 gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleComplete}
                  className="flex-1 gap-2"
                >
                  <Square className="h-4 w-4" />
                  Complete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
