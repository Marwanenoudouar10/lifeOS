import { prisma } from '../prisma.js';
import { formatDate } from '@lifeos/shared';
import { OVERLOAD_THRESHOLDS } from '@lifeos/shared';

interface WellnessWarning {
  type: 'heavy_schedule' | 'low_mood_streak' | 'missed_habits' | 'burnout_risk';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details?: Record<string, any>;
}

async function detect(): Promise<WellnessWarning[]> {
  const warnings: WellnessWarning[] = [];

  await Promise.all([
    detectHeavySchedule(warnings),
    detectLowMoodStreak(warnings),
    detectMissedHabitStreak(warnings),
  ]);

  return warnings;
}

async function detectHeavySchedule(warnings: WellnessWarning[]) {
  // Check consecutive heavy days (>8h scheduled) looking back 7 days
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let consecutiveHeavyDays = 0;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const plan = await prisma.dailyPlan.findUnique({
      where: { date: checkDate },
      include: {
        items: {
          include: {
            task: { select: { estimatedMinutes: true } },
          },
        },
      },
    });

    if (!plan) break;

    const totalMinutes = plan.items.reduce(
      (sum, item) => sum + (item.task.estimatedMinutes ?? 0),
      0
    );

    if (totalMinutes >= OVERLOAD_THRESHOLDS.HEAVY_MINUTES) {
      consecutiveHeavyDays++;
    } else {
      break;
    }
  }

  if (consecutiveHeavyDays >= OVERLOAD_THRESHOLDS.CONSECUTIVE_HEAVY_DAYS) {
    warnings.push({
      type: 'burnout_risk',
      severity: 'critical',
      message: `You've had ${consecutiveHeavyDays} consecutive heavy days (8+ hours scheduled). Consider taking a lighter day to recharge.`,
      details: { consecutiveHeavyDays },
    });
  } else if (consecutiveHeavyDays >= 2) {
    warnings.push({
      type: 'heavy_schedule',
      severity: 'warning',
      message: `${consecutiveHeavyDays} heavy days in a row. Watch your energy levels.`,
      details: { consecutiveHeavyDays },
    });
  }
}

async function detectLowMoodStreak(warnings: WellnessWarning[]) {
  // Check for consecutive low-mood daily reviews
  const recentReviews = await prisma.dailyReview.findMany({
    where: {
      mood: { not: null },
    },
    orderBy: { date: 'desc' },
    take: 7,
    select: { date: true, mood: true },
  });

  if (recentReviews.length === 0) return;

  const lowMoods = new Set(['BAD', 'TERRIBLE']);
  let lowMoodStreak = 0;

  for (const review of recentReviews) {
    if (review.mood && lowMoods.has(review.mood)) {
      lowMoodStreak++;
    } else {
      break;
    }
  }

  if (lowMoodStreak >= 3) {
    warnings.push({
      type: 'low_mood_streak',
      severity: 'critical',
      message: `You've logged ${lowMoodStreak} consecutive days of low mood. Consider reaching out to someone or taking time for self-care.`,
      details: { lowMoodStreak },
    });
  } else if (lowMoodStreak >= 2) {
    warnings.push({
      type: 'low_mood_streak',
      severity: 'warning',
      message: `${lowMoodStreak} days of low mood in a row. How are you feeling today?`,
      details: { lowMoodStreak },
    });
  }
}

async function detectMissedHabitStreak(warnings: WellnessWarning[]) {
  // Check for habits that have been missed for consecutive days
  const activeHabits = await prisma.habit.findMany({
    where: {
      isActive: true,
      frequency: 'DAILY', // Only check daily habits for streak warnings
    },
    include: {
      entries: {
        orderBy: { date: 'desc' },
        take: 7,
      },
    },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const habit of activeHabits) {
    const entryDates = new Set(
      habit.entries.map((e) => formatDate(e.date))
    );

    let missedDays = 0;

    // Walk back from yesterday (today might not be over yet)
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = formatDate(checkDate);

      if (!entryDates.has(dateKey)) {
        missedDays++;
      } else {
        break;
      }
    }

    if (missedDays >= 5) {
      warnings.push({
        type: 'missed_habits',
        severity: 'critical',
        message: `You've missed "${habit.name}" for ${missedDays} days straight. Want to adjust your target or take a break?`,
        details: { habitId: habit.id, habitName: habit.name, missedDays },
      });
    } else if (missedDays >= 3) {
      warnings.push({
        type: 'missed_habits',
        severity: 'warning',
        message: `"${habit.name}" has been missed for ${missedDays} days. A small check-in could restart your momentum.`,
        details: { habitId: habit.id, habitName: habit.name, missedDays },
      });
    }
  }
}

export const wellnessService = {
  detect,
};
