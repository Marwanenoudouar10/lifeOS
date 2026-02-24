import type { FocusSessionStatus } from './common.js';

export interface FocusSession {
  id: string;
  status: FocusSessionStatus;
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  totalSeconds: number;
  pausedSeconds: number;
  notes: string | null;
  taskId: string | null;
  task?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartFocusInput {
  taskId?: string;
  notes?: string;
}
