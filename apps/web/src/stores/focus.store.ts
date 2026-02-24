import { create } from 'zustand';

interface FocusState {
  isActive: boolean;
  sessionId: string | null;
  taskId: string | null;
  taskTitle: string | null;
  elapsedSeconds: number;
  isPaused: boolean;
  intervalId: number | null;
  startSession: (sessionId: string, taskId?: string, taskTitle?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  tick: () => void;
  setIntervalId: (id: number | null) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  isActive: false,
  sessionId: null,
  taskId: null,
  taskTitle: null,
  elapsedSeconds: 0,
  isPaused: false,
  intervalId: null,
  startSession: (sessionId, taskId, taskTitle) =>
    set({ isActive: true, sessionId, taskId: taskId || null, taskTitle: taskTitle || null, elapsedSeconds: 0, isPaused: false }),
  pauseSession: () => set({ isPaused: true }),
  resumeSession: () => set({ isPaused: false }),
  endSession: () =>
    set((s) => {
      if (s.intervalId) clearInterval(s.intervalId);
      return { isActive: false, sessionId: null, taskId: null, taskTitle: null, elapsedSeconds: 0, isPaused: false, intervalId: null };
    }),
  tick: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
  setIntervalId: (id) => set({ intervalId: id }),
}));
