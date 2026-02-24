import type { RecurrenceFrequency } from '../types/common.js';

export function getNextOccurrence(
  lastDate: Date,
  frequency: RecurrenceFrequency,
  interval: number = 1,
  daysOfWeek: number[] = []
): Date {
  const next = new Date(lastDate);

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + interval);
      break;
    case 'WEEKLY':
      if (daysOfWeek.length > 0) {
        // Find next matching day of week
        let found = false;
        for (let i = 1; i <= 7; i++) {
          const candidate = new Date(lastDate);
          candidate.setDate(candidate.getDate() + i);
          if (daysOfWeek.includes(candidate.getDay())) {
            next.setTime(candidate.getTime());
            found = true;
            break;
          }
        }
        if (!found) next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + interval);
      break;
    case 'CUSTOM':
      next.setDate(next.getDate() + interval);
      break;
  }

  return next;
}
