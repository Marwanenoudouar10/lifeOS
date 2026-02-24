import { prisma } from '../prisma.js';
import { getNextOccurrence } from '@lifeos/shared';

export async function recurringTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringTasks = await prisma.task.findMany({
    where: {
      isRecurring: true,
      status: 'DONE',
      recurrenceFrequency: { not: null },
    },
  });

  for (const task of recurringTasks) {
    if (!task.recurrenceFrequency) continue;

    const lastCompleted = task.completedAt || task.updatedAt;
    const nextDate = getNextOccurrence(
      lastCompleted,
      task.recurrenceFrequency,
      task.recurrenceInterval || 1,
      task.recurrenceDaysOfWeek
    );

    if (nextDate <= today) {
      // Check end date
      if (task.recurrenceEndDate && nextDate > task.recurrenceEndDate) continue;

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimatedMinutes: task.estimatedMinutes,
          context: task.context,
          energyLevel: task.energyLevel,
          categoryId: task.categoryId,
          projectId: task.projectId,
          goalId: task.goalId,
          isRecurring: true,
          recurrenceFrequency: task.recurrenceFrequency,
          recurrenceInterval: task.recurrenceInterval,
          recurrenceDaysOfWeek: task.recurrenceDaysOfWeek,
          recurrenceEndDate: task.recurrenceEndDate,
          scheduledDate: nextDate,
        },
      });
    }
  }
}
