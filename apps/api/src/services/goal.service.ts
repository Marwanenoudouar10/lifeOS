import { prisma } from '../prisma.js';
import type { CreateGoalInput, UpdateGoalInput } from '@lifeos/shared';
import type { Prisma } from '@prisma/client';

const goalIncludes = {
  _count: {
    select: {
      tasks: true,
      projects: true,
    },
  },
  milestones: {
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.GoalInclude;

async function getAll(filters: { status?: string; timeframe?: string } = {}) {
  const where: Prisma.GoalWhereInput = {};

  if (filters.status) {
    where.status = filters.status as any;
  }

  if (filters.timeframe) {
    where.timeframe = filters.timeframe as any;
  }

  return prisma.goal.findMany({
    where,
    include: goalIncludes,
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id: string) {
  return prisma.goal.findUnique({
    where: { id },
    include: {
      ...goalIncludes,
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
      projects: {
        include: {
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

async function create(data: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    },
    include: goalIncludes,
  });
}

async function update(id: string, data: UpdateGoalInput) {
  return prisma.goal.update({
    where: { id },
    data: {
      ...data,
      targetDate: data.targetDate !== undefined
        ? data.targetDate ? new Date(data.targetDate) : null
        : undefined,
    },
    include: goalIncludes,
  });
}

async function remove(id: string) {
  return prisma.goal.delete({ where: { id } });
}

async function computeProgress(id: string) {
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      tasks: { select: { status: true } },
      milestones: { select: { isCompleted: true } },
    },
  });

  if (!goal) {
    throw new Error(`Goal not found: ${id}`);
  }

  const totalTasks = goal.tasks.length;
  const doneTasks = goal.tasks.filter((t) => t.status === 'DONE').length;

  const totalMilestones = goal.milestones.length;
  const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;

  const totalItems = totalTasks + totalMilestones;
  const doneItems = doneTasks + completedMilestones;

  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // Persist computed progress
  const updated = await prisma.goal.update({
    where: { id },
    data: { progress },
    include: goalIncludes,
  });

  return {
    ...updated,
    breakdown: {
      totalTasks,
      doneTasks,
      totalMilestones,
      completedMilestones,
      progress,
    },
  };
}

export const goalService = {
  getAll,
  getById,
  create,
  update,
  remove,
  computeProgress,
};
