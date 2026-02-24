import { prisma } from '../prisma.js';
import { formatDate } from '@lifeos/shared';

async function getTodayOverview() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const [todayTasks, activeSession, habitsData, plan] = await Promise.all([
    // Tasks scheduled for today or with deadline today
    prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        OR: [
          {
            scheduledDate: {
              gte: today,
              lte: endOfDay,
            },
          },
          {
            deadline: {
              gte: today,
              lte: endOfDay,
            },
          },
        ],
      },
      include: {
        tags: { include: { tag: true } },
        category: true,
        project: true,
        goal: true,
      },
      orderBy: [{ priority: 'asc' }, { deadline: 'asc' }],
    }),

    // Active focus session
    prisma.focusSession.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    }),

    // Habits due today with today's entry if exists
    getHabitsDueToday(today),

    // Today's plan with items
    prisma.dailyPlan.findUnique({
      where: { date: today },
      include: {
        items: {
          include: {
            task: {
              include: {
                tags: { include: { tag: true } },
                category: true,
                project: true,
              },
            },
          },
          orderBy: [{ bucket: 'asc' }, { sortOrder: 'asc' }],
        },
        timeBlocks: {
          orderBy: { startTime: 'asc' },
        },
      },
    }),
  ]);

  // Count completed tasks today
  const tasksCompletedToday = await prisma.task.count({
    where: {
      completedAt: {
        gte: today,
        lte: endOfDay,
      },
    },
  });

  // Focus time today
  const focusSessionsToday = await prisma.focusSession.findMany({
    where: {
      status: 'COMPLETED',
      startedAt: {
        gte: today,
        lte: endOfDay,
      },
    },
    select: { totalSeconds: true },
  });

  const focusMinutesToday = Math.round(
    focusSessionsToday.reduce((sum, s) => sum + s.totalSeconds, 0) / 60
  );

  // Overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
      deadline: { lt: today },
    },
    include: {
      category: true,
      project: true,
    },
    orderBy: { deadline: 'asc' },
  });

  return {
    tasks: todayTasks,
    overdueTasks,
    activeSession,
    habits: habitsData,
    plan,
    stats: {
      tasksCompletedToday,
      focusMinutesToday,
      totalPlanItems: plan?.items.length ?? 0,
      completedPlanItems: plan?.items.filter((i) => i.isComplete).length ?? 0,
    },
  };
}

async function getHabitsDueToday(today: Date) {
  const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ...

  const habits = await prisma.habit.findMany({
    where: {
      isActive: true,
      OR: [
        { frequency: 'DAILY' },
        {
          frequency: 'WEEKLY',
          daysOfWeek: { has: dayOfWeek },
        },
        {
          frequency: 'CUSTOM',
          daysOfWeek: { has: dayOfWeek },
        },
      ],
    },
    include: {
      entries: {
        where: { date: today },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  return habits.map((habit) => ({
    ...habit,
    isCompletedToday: habit.entries.length > 0 && habit.entries[0].count >= habit.targetCount,
    todayEntry: habit.entries[0] ?? null,
  }));
}

async function getUpcoming(days: number = 7) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setUTCHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
      deadline: {
        gte: today,
        lte: futureDate,
      },
    },
    include: {
      tags: { include: { tag: true } },
      category: true,
      project: true,
      goal: true,
    },
    orderBy: { deadline: 'asc' },
  });

  // Group by date
  const grouped = new Map<string, typeof tasks>();
  for (const task of tasks) {
    if (task.deadline) {
      const key = formatDate(task.deadline);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }
  }

  return {
    tasks,
    byDate: Object.fromEntries(grouped),
    totalCount: tasks.length,
  };
}

async function getActiveGoals() {
  return prisma.goal.findMany({
    where: {
      status: 'IN_PROGRESS',
    },
    include: {
      _count: {
        select: {
          tasks: true,
          projects: true,
        },
      },
      milestones: {
        orderBy: { sortOrder: 'asc' },
      },
      tasks: {
        where: { status: 'DONE' },
        select: { id: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export const dashboardService = {
  getTodayOverview,
  getUpcoming,
  getActiveGoals,
};
