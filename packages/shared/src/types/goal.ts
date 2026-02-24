import type { GoalStatus, GoalTimeframe } from './common.js';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  timeframe: GoalTimeframe;
  targetDate: string | null;
  progress: number;
  color: string;
  _count?: { tasks: number; projects: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  timeframe?: GoalTimeframe;
  targetDate?: string;
  color?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
  progress?: number;
}
