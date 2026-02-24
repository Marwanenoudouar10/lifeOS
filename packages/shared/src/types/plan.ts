import type { PlanItemBucket } from './common.js';
import type { Task } from './task.js';

export interface DailyPlan {
  id: string;
  date: string;
  notes: string | null;
  isComplete: boolean;
  items: PlanItem[];
  timeBlocks: TimeBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanItem {
  id: string;
  bucket: PlanItemBucket;
  sortOrder: number;
  isComplete: boolean;
  planId: string;
  taskId: string;
  task: Task;
  createdAt: string;
  updatedAt: string;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string | null;
  planId: string;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanItemInput {
  taskId: string;
  bucket?: PlanItemBucket;
  sortOrder?: number;
}

export interface CreateTimeBlockInput {
  startTime: string;
  endTime: string;
  label?: string;
  taskId?: string;
}

export interface OverloadCheck {
  totalMinutes: number;
  isOverloaded: boolean;
  isHeavy: boolean;
  consecutiveHeavyDays: number;
  warning: string | null;
}
