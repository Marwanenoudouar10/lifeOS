export const PRIORITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  NONE: 0,
} as const;

export const PRIORITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  NONE: '#6b7280',
} as const;

export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
  DEFERRED: 'Deferred',
} as const;

export const CONTEXT_LABELS = {
  HOME: 'Home',
  WORK: 'Work',
  ERRANDS: 'Errands',
  COMPUTER: 'Computer',
  PHONE: 'Phone',
  ANYWHERE: 'Anywhere',
} as const;

export const CONTEXT_ICONS = {
  HOME: '🏠',
  WORK: '💼',
  ERRANDS: '🏃',
  COMPUTER: '💻',
  PHONE: '📱',
  ANYWHERE: '🌍',
} as const;

export const ENERGY_LABELS = {
  HIGH: 'High Energy',
  MEDIUM: 'Medium Energy',
  LOW: 'Low Energy',
} as const;

export const MOOD_LABELS = {
  GREAT: 'Great',
  GOOD: 'Good',
  OKAY: 'Okay',
  BAD: 'Bad',
  TERRIBLE: 'Terrible',
} as const;

export const OVERLOAD_THRESHOLDS = {
  WARN_MINUTES: 360,   // 6 hours
  HEAVY_MINUTES: 480,  // 8 hours
  CONSECUTIVE_HEAVY_DAYS: 3,
} as const;

export const DEFAULT_CATEGORIES = [
  { name: 'Personal', color: '#6366f1' },
  { name: 'Work', color: '#0ea5e9' },
  { name: 'Health', color: '#10b981' },
  { name: 'Finance', color: '#f59e0b' },
  { name: 'Learning', color: '#8b5cf6' },
  { name: 'Home', color: '#ec4899' },
] as const;
