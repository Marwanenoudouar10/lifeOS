import { prisma } from '../prisma.js';
import { calculatePriorityScore, checkOverload, formatDate } from '@lifeos/shared';
import type { CreatePlanItemInput, CreateTimeBlockInput } from '@lifeos/shared';
import type { PlanItemBucket } from '@prisma/client';

const planIncludes = {
  items: {
    include: {
      task: {
        include: {
          tags: { include: { tag: true } },
          category: true,
          project: true,
          goal: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  timeBlocks: {
    orderBy: { startTime: 'asc' as const },
  },
};

async function getOrCreateByDate(date: string) {
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);

  let plan = await prisma.dailyPlan.findUnique({
    where: { date: dateObj },
    include: planIncludes,
  });

  if (!plan) {
    plan = await prisma.dailyPlan.create({
      data: { date: dateObj },
      include: planIncludes,
    });
  }

  return plan;
}

async function addItem(planId: string, input: CreatePlanItemInput) {
  return prisma.planItem.create({
    data: {
      planId,
      taskId: input.taskId,
      bucket: input.bucket ?? 'SECONDARY',
      sortOrder: input.sortOrder ?? 0,
    },
    include: {
      task: {
        include: {
          tags: { include: { tag: true } },
          category: true,
          project: true,
          goal: true,
        },
      },
    },
  });
}

async function removeItem(itemId: string) {
  return prisma.planItem.delete({ where: { id: itemId } });
}

async function updateItem(itemId: string, data: {
  bucket?: PlanItemBucket;
  sortOrder?: number;
  isComplete?: boolean;
}) {
  return prisma.planItem.update({
    where: { id: itemId },
    data,
    include: {
      task: {
        include: {
          tags: { include: { tag: true } },
          category: true,
          project: true,
          goal: true,
        },
      },
    },
  });
}

async function getItems(planId: string) {
  return prisma.planItem.findMany({
    where: { planId },
    include: {
      task: {
        include: {
          tags: { include: { tag: true } },
          category: true,
          project: true,
          goal: true,
        },
      },
    },
    orderBy: [{ bucket: 'asc' }, { sortOrder: 'asc' }],
  });
}

async function generatePlan(date: string) {
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(dateObj);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Get or create the plan
  const plan = await getOrCreateByDate(date);

  // Find tasks already in the plan
  const existingTaskIds = new Set(plan.items.map((item) => item.taskId));

  // Pull TODO tasks that are scheduled for this date, have a deadline on/before this date,
  // or have no date at all (backlog tasks)
  const candidateTasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
      id: { notIn: [...existingTaskIds] },
      OR: [
        { scheduledDate: { gte: dateObj, lte: endOfDay } },
        { deadline: { lte: endOfDay } },
      ],
    },
    include: {
      blockedBy: { select: { id: true } },
    },
  });

  // Score all candidate tasks
  const scored = candidateTasks.map((task) => ({
    task,
    score: calculatePriorityScore({
      priority: task.priority,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      isImportant: task.isImportant,
      isUrgent: task.isUrgent,
      estimatedMinutes: task.estimatedMinutes,
      goalId: task.goalId,
      blockedBy: task.blockedBy,
    }),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Bucket: top 3 = TOP, next 3-5 = SECONDARY, rest = OPTIONAL
  const planItems: { taskId: string; bucket: PlanItemBucket; sortOrder: number }[] = [];

  scored.forEach((item, index) => {
    let bucket: PlanItemBucket;
    if (index < 3) {
      bucket = 'TOP';
    } else if (index < 8) {
      bucket = 'SECONDARY';
    } else {
      bucket = 'OPTIONAL';
    }

    planItems.push({
      taskId: item.task.id,
      bucket,
      sortOrder: index,
    });
  });

  // Create all plan items in a transaction
  if (planItems.length > 0) {
    await prisma.planItem.createMany({
      data: planItems.map((pi) => ({
        planId: plan.id,
        ...pi,
      })),
      skipDuplicates: true,
    });
  }

  // Return the full plan
  return getOrCreateByDate(date);
}

async function checkPlanOverload(date: string) {
  const plan = await getOrCreateByDate(date);

  const totalMinutes = plan.items.reduce((sum, item) => {
    return sum + (item.task.estimatedMinutes ?? 0);
  }, 0);

  // Count consecutive heavy days leading up to this date
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);
  let consecutiveHeavyDays = 0;

  for (let i = 1; i <= 7; i++) {
    const prevDate = new Date(dateObj);
    prevDate.setDate(prevDate.getDate() - i);

    const prevPlan = await prisma.dailyPlan.findUnique({
      where: { date: prevDate },
      include: {
        items: {
          include: {
            task: { select: { estimatedMinutes: true } },
          },
        },
      },
    });

    if (!prevPlan) break;

    const prevMinutes = prevPlan.items.reduce((sum, item) => {
      return sum + (item.task.estimatedMinutes ?? 0);
    }, 0);

    // 480 minutes = 8 hours = heavy day threshold
    if (prevMinutes >= 480) {
      consecutiveHeavyDays++;
    } else {
      break;
    }
  }

  return checkOverload(totalMinutes, consecutiveHeavyDays);
}

async function getTimeBlocks(planId: string) {
  return prisma.timeBlock.findMany({
    where: { planId },
    orderBy: { startTime: 'asc' },
  });
}

async function addTimeBlock(planId: string, input: CreateTimeBlockInput) {
  return prisma.timeBlock.create({
    data: {
      planId,
      startTime: input.startTime,
      endTime: input.endTime,
      label: input.label ?? null,
      taskId: input.taskId ?? null,
    },
  });
}

async function removeTimeBlock(id: string) {
  return prisma.timeBlock.delete({ where: { id } });
}

async function rollover(fromDate: string, toDate: string) {
  const fromDateObj = new Date(fromDate);
  fromDateObj.setUTCHours(0, 0, 0, 0);

  const fromPlan = await prisma.dailyPlan.findUnique({
    where: { date: fromDateObj },
    include: {
      items: {
        where: { isComplete: false },
        include: {
          task: { select: { id: true, status: true } },
        },
      },
    },
  });

  if (!fromPlan) {
    throw new Error(`No plan found for date: ${fromDate}`);
  }

  // Filter: only roll over items whose task is still TODO or IN_PROGRESS
  const incompleteItems = fromPlan.items.filter(
    (item) => item.task.status === 'TODO' || item.task.status === 'IN_PROGRESS'
  );

  if (incompleteItems.length === 0) {
    return { rolledOver: 0, plan: await getOrCreateByDate(toDate) };
  }

  // Get or create the target plan
  const toPlan = await getOrCreateByDate(toDate);

  // Find tasks already in the target plan
  const existingTaskIds = new Set(toPlan.items.map((item) => item.taskId));

  const toCreate = incompleteItems
    .filter((item) => !existingTaskIds.has(item.taskId))
    .map((item, index) => ({
      planId: toPlan.id,
      taskId: item.taskId,
      bucket: item.bucket,
      sortOrder: toPlan.items.length + index,
    }));

  if (toCreate.length > 0) {
    await prisma.planItem.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  return {
    rolledOver: toCreate.length,
    plan: await getOrCreateByDate(toDate),
  };
}

export const planService = {
  getOrCreateByDate,
  addItem,
  removeItem,
  updateItem,
  getItems,
  generatePlan,
  checkOverload: checkPlanOverload,
  getTimeBlocks,
  addTimeBlock,
  removeTimeBlock,
  rollover,
};
