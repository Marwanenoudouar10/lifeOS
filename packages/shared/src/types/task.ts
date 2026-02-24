import type { TaskStatus, TaskPriority, EnergyLevel, Context, RecurrenceFrequency } from './common.js';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  deadline: string | null;
  scheduledDate: string | null;
  completedAt: string | null;
  context: Context | null;
  energyLevel: EnergyLevel | null;
  isImportant: boolean;
  isUrgent: boolean;
  sortOrder: number;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceInterval: number | null;
  recurrenceDaysOfWeek: number[];
  recurrenceEndDate: string | null;
  categoryId: string | null;
  projectId: string | null;
  goalId: string | null;
  parentId: string | null;
  subtasks?: Task[];
  tags?: { tag: { id: string; name: string; color: string } }[];
  category?: { id: string; name: string; color: string } | null;
  project?: { id: string; name: string; color: string } | null;
  goal?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  notes?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimatedMinutes?: number;
  deadline?: string;
  scheduledDate?: string;
  context?: Context;
  energyLevel?: EnergyLevel;
  isImportant?: boolean;
  isUrgent?: boolean;
  categoryId?: string;
  projectId?: string;
  goalId?: string;
  parentId?: string;
  tagIds?: string[];
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceDaysOfWeek?: number[];
  recurrenceEndDate?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  sortOrder?: number;
  actualMinutes?: number;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  categoryId?: string;
  projectId?: string;
  goalId?: string;
  context?: Context;
  isImportant?: boolean;
  isUrgent?: boolean;
  parentId?: string | null;
  search?: string;
}

export interface BrainDumpEntry {
  raw: string;
  title: string;
  deadline?: string;
  priority?: TaskPriority;
  context?: Context;
  estimatedMinutes?: number;
}
