import { prisma } from '../prisma.js';

export async function dailyRollover() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find yesterday's plan with incomplete items
  const yesterdayPlan = await prisma.dailyPlan.findUnique({
    where: { date: yesterday },
    include: {
      items: {
        where: { isComplete: false },
        include: { task: true },
      },
    },
  });

  if (!yesterdayPlan || yesterdayPlan.items.length === 0) return;

  // Get or create today's plan
  let todayPlan = await prisma.dailyPlan.findUnique({ where: { date: today } });
  if (!todayPlan) {
    todayPlan = await prisma.dailyPlan.create({ data: { date: today } });
  }

  // Rollover incomplete items
  for (const item of yesterdayPlan.items) {
    if (item.task.status !== 'DONE' && item.task.status !== 'CANCELLED') {
      await prisma.planItem.upsert({
        where: { planId_taskId: { planId: todayPlan.id, taskId: item.taskId } },
        create: {
          planId: todayPlan.id,
          taskId: item.taskId,
          bucket: 'SECONDARY',
          sortOrder: item.sortOrder,
        },
        update: {},
      });
    }
  }

  console.log(`Rolled over ${yesterdayPlan.items.length} items to today`);
}
