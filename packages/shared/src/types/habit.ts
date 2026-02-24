import type { HabitFrequency } from './common.js';

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  frequency: HabitFrequency;
  targetCount: number;
  daysOfWeek: number[];
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  isActive: boolean;
  entries?: HabitEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  date: string;
  count: number;
  notes: string | null;
  habitId: string;
  createdAt: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency;
  targetCount?: number;
  daysOfWeek?: number[];
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  isActive?: boolean;
}

export interface HabitCheckInInput {
  date: string;
  count?: number;
  notes?: string;
}
