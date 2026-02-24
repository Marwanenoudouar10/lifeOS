import { prisma } from '../prisma.js';

export async function reminderCheck() {
  const now = new Date();

  const dueReminders = await prisma.reminder.findMany({
    where: {
      triggerAt: { lte: now },
      isSent: false,
      isDismissed: false,
    },
    include: { task: { select: { id: true, title: true } } },
  });

  for (const reminder of dueReminders) {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { isSent: true },
    });
  }

  if (dueReminders.length > 0) {
    console.log(`Sent ${dueReminders.length} reminders`);
  }
}
