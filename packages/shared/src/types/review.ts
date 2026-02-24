import type { Mood, EnergyLevel } from './common.js';

export interface DailyReview {
  id: string;
  date: string;
  mood: Mood | null;
  energyLevel: EnergyLevel | null;
  tasksCompleted: number;
  tasksPlanned: number;
  focusMinutes: number;
  wins: string[];
  challenges: string[];
  notes: string | null;
  gratitude: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  tasksCompleted: number;
  tasksCreated: number;
  focusMinutes: number;
  habitsCompleted: number;
  habitsMissed: number;
  topWins: string[];
  challenges: string[];
  lessonsLearned: string[];
  nextWeekFocus: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyReviewInput {
  date: string;
  mood?: Mood;
  energyLevel?: EnergyLevel;
  wins?: string[];
  challenges?: string[];
  notes?: string;
  gratitude?: string;
}

export interface CreateWeeklyReviewInput {
  weekStart: string;
  topWins?: string[];
  challenges?: string[];
  lessonsLearned?: string[];
  nextWeekFocus?: string[];
  notes?: string;
}
