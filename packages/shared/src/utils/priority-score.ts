import { PRIORITY_WEIGHTS, OVERLOAD_THRESHOLDS } from '../constants/index.js';
import type { TaskPriority } from '../types/common.js';

interface ScoringTask {
  priority: TaskPriority;
  deadline: string | null;
  isImportant: boolean;
  isUrgent: boolean;
  estimatedMinutes: number | null;
  goalId: string | null;
  blockedBy?: { id: string }[];
}

export function calculatePriorityScore(task: ScoringTask): number {
  let score = PRIORITY_WEIGHTS[task.priority];

  // Deadline urgency: closer deadline = higher score
  if (task.deadline) {
    const daysUntil = Math.max(0, (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 1) score += 50;
    else if (daysUntil <= 3) score += 30;
    else if (daysUntil <= 7) score += 15;
  }

  // Eisenhower flags
  if (task.isImportant && task.isUrgent) score += 40;
  else if (task.isImportant) score += 20;
  else if (task.isUrgent) score += 15;

  // Quick-win bonus (under 15 min)
  if (task.estimatedMinutes && task.estimatedMinutes <= 15) score += 10;

  // Goal-connection bonus
  if (task.goalId) score += 10;

  // Blocked penalty
  if (task.blockedBy && task.blockedBy.length > 0) score -= 30;

  return Math.max(0, score);
}

export interface OverloadResult {
  totalMinutes: number;
  isOverloaded: boolean;
  isHeavy: boolean;
  warning: string | null;
}

export function checkOverload(totalMinutes: number, consecutiveHeavyDays: number = 0): OverloadResult {
  const isHeavy = totalMinutes >= OVERLOAD_THRESHOLDS.WARN_MINUTES;
  const isOverloaded = totalMinutes >= OVERLOAD_THRESHOLDS.HEAVY_MINUTES;

  let warning: string | null = null;
  if (isOverloaded) {
    warning = `You have ${Math.round(totalMinutes / 60)}h of tasks scheduled. Consider deferring some tasks.`;
  } else if (isHeavy) {
    warning = `Heavy day ahead with ${Math.round(totalMinutes / 60)}h of tasks. Pace yourself.`;
  }

  if (consecutiveHeavyDays >= OVERLOAD_THRESHOLDS.CONSECUTIVE_HEAVY_DAYS) {
    warning = `${consecutiveHeavyDays} heavy days in a row. You need a lighter day soon.`;
  }

  return { totalMinutes, isOverloaded, isHeavy, warning };
}
