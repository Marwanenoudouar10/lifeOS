import { z } from 'zod';

const taskPriority = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']);
const taskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'DEFERRED']);
const energyLevel = z.enum(['HIGH', 'MEDIUM', 'LOW']);
const context = z.enum(['HOME', 'WORK', 'ERRANDS', 'COMPUTER', 'PHONE', 'ANYWHERE']);
const recurrenceFrequency = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  priority: taskPriority.optional(),
  status: taskStatus.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  deadline: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  scheduledDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  context: context.optional(),
  energyLevel: energyLevel.optional(),
  isImportant: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
  parentId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: recurrenceFrequency.optional(),
  recurrenceInterval: z.number().int().positive().optional(),
  recurrenceDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  sortOrder: z.number().int().optional(),
  actualMinutes: z.number().int().positive().optional(),
});

export const brainDumpSchema = z.object({
  entries: z.array(z.object({
    raw: z.string().min(1),
  })).min(1).max(50),
});
