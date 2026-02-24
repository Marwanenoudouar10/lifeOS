export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'DEFERRED';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Context = 'HOME' | 'WORK' | 'ERRANDS' | 'COMPUTER' | 'PHONE' | 'ANYWHERE';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type GoalTimeframe = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LONG_TERM';
export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type FocusSessionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type PlanItemBucket = 'TOP' | 'SECONDARY' | 'OPTIONAL';
export type ReminderType = 'DEADLINE' | 'NUDGE' | 'FOLLOW_UP';
export type Mood = 'GREAT' | 'GOOD' | 'OKAY' | 'BAD' | 'TERRIBLE';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
