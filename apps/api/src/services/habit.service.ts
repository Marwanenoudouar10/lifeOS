import { prisma } from '../prisma.js';
import { formatDate } from '@lifeos/shared';
import type { CreateHabitInput, UpdateHabitInput, HabitCheckInInput } from '@lifeos/shared';

async function getAll(includeEntries: boolean = false) {
  return prisma.habit.findMany({
    include: {
      entries: includeEntries
        ? { orderBy: { date: 'desc' }, take: 30 }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id: string) {
  return prisma.habit.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { date: 'desc' },
        take: 60,
      },
    },
  });
}

async function create(data: CreateHabitInput) {
  return prisma.habit.create({
    data,
    include: {
      entries: true,
    },
  });
}

async function update(id: string, data: UpdateHabitInput) {
  return prisma.habit.update({
    where: { id },
    data,
    include: {
      entries: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  });
}

async function remove(id: string) {
  return prisma.habit.delete({ where: { id } });
}

async function checkIn(habitId: string, input: HabitCheckInInput) {
  const date = new Date(input.date);
  // Normalize to date-only (strip time)
  date.setUTCHours(0, 0, 0, 0);

  const entry = await prisma.habitEntry.upsert({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
    update: {
      count: input.count ?? 1,
      notes: input.notes,
    },
    create: {
      habitId,
      date,
      count: input.count ?? 1,
      notes: input.notes,
    },
  });

  // Update streak after check-in
  await updateStreaks(habitId);

  return entry;
}

async function updateStreaks(habitId: string) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      entries: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!habit || habit.entries.length === 0) {
    return;
  }

  // Calculate current streak by walking back from today
  let currentStreak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const entryDates = new Set(
    habit.entries.map((e) => formatDate(e.date))
  );

  // Start from today and walk backward
  const checkDate = new Date(today);
  // If today doesn't have an entry, start from yesterday
  if (!entryDates.has(formatDate(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
    // If yesterday also doesn't have an entry, streak is 0
    if (!entryDates.has(formatDate(checkDate))) {
      await prisma.habit.update({
        where: { id: habitId },
        data: {
          currentStreak: 0,
          lastCheckIn: habit.entries[0].date,
        },
      });
      return;
    }
  }

  // Walk backward counting consecutive days
  while (entryDates.has(formatDate(checkDate))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const longestStreak = Math.max(habit.longestStreak, currentStreak);

  await prisma.habit.update({
    where: { id: habitId },
    data: {
      currentStreak,
      longestStreak,
      lastCheckIn: habit.entries[0].date,
    },
  });
}

async function getCalendar(habitId: string, startDate: string, endDate: string) {
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  return prisma.habitEntry.findMany({
    where: {
      habitId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: 'asc' },
  });
}

export const habitService = {
  getAll,
  getById,
  create,
  update,
  remove,
  checkIn,
  updateStreaks,
  getCalendar,
};
