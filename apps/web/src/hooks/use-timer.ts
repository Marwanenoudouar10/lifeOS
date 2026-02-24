import { useEffect, useCallback } from 'react';
import { useFocusStore } from '@/stores/focus.store';
import { useStartFocus, usePauseFocus, useResumeFocus, useCompleteFocus } from './use-focus';

export function useTimer() {
  const store = useFocusStore();
  const startMutation = useStartFocus();
  const pauseMutation = usePauseFocus();
  const resumeMutation = useResumeFocus();
  const completeMutation = useCompleteFocus();

  useEffect(() => {
    if (store.isActive && !store.isPaused) {
      const id = window.setInterval(() => store.tick(), 1000);
      store.setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [store.isActive, store.isPaused]);

  const start = useCallback(async (taskId?: string, taskTitle?: string) => {
    const session = await startMutation.mutateAsync({ taskId });
    store.startSession(session.id, taskId, taskTitle);
  }, [startMutation, store]);

  const pause = useCallback(async () => {
    if (store.sessionId) {
      await pauseMutation.mutateAsync(store.sessionId);
      store.pauseSession();
    }
  }, [pauseMutation, store]);

  const resume = useCallback(async () => {
    if (store.sessionId) {
      await resumeMutation.mutateAsync(store.sessionId);
      store.resumeSession();
    }
  }, [resumeMutation, store]);

  const complete = useCallback(async (notes?: string) => {
    if (store.sessionId) {
      await completeMutation.mutateAsync({ id: store.sessionId, data: notes ? { notes } : undefined });
      store.endSession();
    }
  }, [completeMutation, store]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return {
    ...store,
    start,
    pause,
    resume,
    complete,
    formatTime,
    formattedTime: formatTime(store.elapsedSeconds),
  };
}
