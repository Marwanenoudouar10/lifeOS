import { z } from 'zod';

export * from './task.schema.js';

// ── Project schemas ──
export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  deadline: z.string().optional(),
  categoryId: z.string().optional(),
  goalId: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  sortOrder: z.number().int().optional(),
});

// ── Goal schemas ──
export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  timeframe: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LONG_TERM']).optional(),
  targetDate: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// ── Habit schemas ──
export const createHabitSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
  targetCount: z.number().int().positive().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const habitCheckInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

// ── Focus schemas ──
export const startFocusSchema = z.object({
  taskId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ── Plan schemas ──
export const createPlanItemSchema = z.object({
  taskId: z.string(),
  bucket: z.enum(['TOP', 'SECONDARY', 'OPTIONAL']).optional(),
  sortOrder: z.number().int().optional(),
});

export const createTimeBlockSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  label: z.string().max(200).optional(),
  taskId: z.string().optional(),
});

// ── Review schemas ──
export const createDailyReviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.enum(['GREAT', 'GOOD', 'OKAY', 'BAD', 'TERRIBLE']).optional(),
  energyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  wins: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
  gratitude: z.string().max(1000).optional(),
});

export const createWeeklyReviewSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topWins: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  lessonsLearned: z.array(z.string()).optional(),
  nextWeekFocus: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
});

// ── Category / Tag schemas ──
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(10).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// ── Reminder schemas ──
export const createReminderSchema = z.object({
  type: z.enum(['DEADLINE', 'NUDGE', 'FOLLOW_UP']).optional(),
  message: z.string().max(500).optional(),
  triggerAt: z.string().datetime(),
  taskId: z.string().optional(),
});
