import { prisma } from '../prisma.js';
import { formatDate } from '@lifeos/shared';

async function completionRate(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  // Tasks completed per day
  const completedTasks = await prisma.task.findMany({
    where: {
      completedAt: { gte: startDate },
    },
    select: { completedAt: true },
  });

  // Tasks created per day
  const createdTasks = await prisma.task.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  // Build per-day map
  const dayMap = new Map<string, { completed: number; created: number }>();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = formatDate(d);
    dayMap.set(key, { completed: 0, created: 0 });
  }

  for (const t of completedTasks) {
    if (t.completedAt) {
      const key = formatDate(t.completedAt);
      const entry = dayMap.get(key);
      if (entry) entry.completed++;
    }
  }

  for (const t of createdTasks) {
    const key = formatDate(t.createdAt);
    const entry = dayMap.get(key);
    if (entry) entry.created++;
  }

  const result = Array.from(dayMap.entries()).map(([date, counts]) => ({
    date,
    completed: counts.completed,
    created: counts.created,
    rate: counts.created > 0 ? Math.round((counts.completed / counts.created) * 100) : 0,
  }));

  return result;
}

async function focusTime(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  const sessions = await prisma.focusSession.findMany({
    where: {
      status: 'COMPLETED',
      startedAt: { gte: startDate },
    },
    select: { startedAt: true, totalSeconds: true },
  });

  // Build per-day map
  const dayMap = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    dayMap.set(formatDate(d), 0);
  }

  for (const s of sessions) {
    const key = formatDate(s.startedAt);
    const current = dayMap.get(key);
    if (current !== undefined) {
      dayMap.set(key, current + s.totalSeconds);
    }
  }

  return Array.from(dayMap.entries()).map(([date, totalSeconds]) => ({
    date,
    totalSeconds,
    totalMinutes: Math.round(totalSeconds / 60),
    totalHours: parseFloat((totalSeconds / 3600).toFixed(2)),
  }));
}

async function momentum() {
  // Rolling 7-day completion count for the past 30 days
  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days - 7); // Extra 7 days for rolling window
  startDate.setUTCHours(0, 0, 0, 0);

  const completedTasks = await prisma.task.findMany({
    where: {
      completedAt: { gte: startDate },
    },
    select: { completedAt: true },
  });

  // Build per-day count of completions
  const dailyCounts = new Map<string, number>();
  for (const t of completedTasks) {
    if (t.completedAt) {
      const key = formatDate(t.completedAt);
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    }
  }

  // Calculate rolling 7-day sum for each of the past N days
  const result: { date: string; rollingCount: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateKey = formatDate(d);

    let rollingCount = 0;
    for (let j = 0; j < 7; j++) {
      const windowDate = new Date(d);
      windowDate.setDate(windowDate.getDate() - j);
      rollingCount += dailyCounts.get(formatDate(windowDate)) ?? 0;
    }

    result.push({ date: dateKey, rollingCount });
  }

  return result;
}

async function categoryBreakdown() {
  // Count tasks by category (all tasks, not just completed)
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Also count tasks with completed status per category
  const completedByCat = await prisma.task.groupBy({
    by: ['categoryId'],
    where: { status: 'DONE' },
    _count: true,
  });

  const completedMap = new Map(
    completedByCat.map((c) => [c.categoryId, c._count])
  );

  // Count uncategorized tasks
  const uncategorizedTotal = await prisma.task.count({
    where: { categoryId: null },
  });
  const uncategorizedCompleted = await prisma.task.count({
    where: { categoryId: null, status: 'DONE' },
  });

  const result = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    totalTasks: cat._count.tasks,
    completedTasks: completedMap.get(cat.id) ?? 0,
  }));

  if (uncategorizedTotal > 0) {
    result.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      color: '#6b7280',
      totalTasks: uncategorizedTotal,
      completedTasks: uncategorizedCompleted,
    });
  }

  return result;
}

export const analyticsService = {
  completionRate,
  focusTime,
  momentum,
  categoryBreakdown,
};
