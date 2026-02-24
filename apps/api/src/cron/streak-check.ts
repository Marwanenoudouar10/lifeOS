import { prisma } from '../prisma.js';

export async function streakCheck() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const activeHabits = await prisma.habit.findMany({
    where: { isActive: true },
  });

  for (const habit of activeHabits) {
    // Check if there's an entry for yesterday (for daily habits)
    if (habit.frequency === 'DAILY') {
      const entry = await prisma.habitEntry.findUnique({
        where: { habitId_date: { habitId: habit.id, date: yesterday } },
      });

      if (!entry) {
        // Reset streak if missed yesterday
        if (habit.currentStreak > 0) {
          await prisma.habit.update({
            where: { id: habit.id },
            data: { currentStreak: 0 },
          });
        }
      }
    }
  }
}
