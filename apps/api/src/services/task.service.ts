import { prisma } from '../prisma.js';
import { calculatePriorityScore } from '@lifeos/shared';
import type { TaskFilters, CreateTaskInput, UpdateTaskInput } from '@lifeos/shared';
import type { Prisma } from '@prisma/client';

const taskIncludes = {
  subtasks: true,
  tags: {
    include: {
      tag: true,
    },
  },
  category: true,
  project: true,
  goal: true,
  blockedBy: { select: { id: true, title: true, status: true } },
} satisfies Prisma.TaskInclude;

async function getAll(filters: TaskFilters = {}) {
  const where: Prisma.TaskWhereInput = {};

  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters.priority) {
    where.priority = Array.isArray(filters.priority)
      ? { in: filters.priority }
      : filters.priority;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.goalId) {
    where.goalId = filters.goalId;
  }

  if (filters.context) {
    where.context = filters.context;
  }

  if (filters.isImportant !== undefined) {
    where.isImportant = filters.isImportant;
  }

  if (filters.isUrgent !== undefined) {
    where.isUrgent = filters.isUrgent;
  }

  if (filters.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.task.findMany({
    where,
    include: taskIncludes,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

async function getById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: taskIncludes,
  });
}

async function create(data: CreateTaskInput) {
  const { tagIds, ...taskData } = data;

  const task = await prisma.task.create({
    data: {
      ...taskData,
      deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
      scheduledDate: taskData.scheduledDate ? new Date(taskData.scheduledDate) : undefined,
      recurrenceEndDate: taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : undefined,
      tags: tagIds && tagIds.length > 0
        ? {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
    include: taskIncludes,
  });

  return task;
}

async function update(id: string, data: UpdateTaskInput) {
  const { tagIds, ...taskData } = data;

  // If marking as DONE, set completedAt
  const completedAt =
    taskData.status === 'DONE'
      ? new Date()
      : taskData.status
        ? null
        : undefined;

  const task = await prisma.$transaction(async (tx) => {
    // If tagIds are provided, replace all tags
    if (tagIds !== undefined) {
      await tx.taskTag.deleteMany({ where: { taskId: id } });
      if (tagIds.length > 0) {
        await tx.taskTag.createMany({
          data: tagIds.map((tagId) => ({ taskId: id, tagId })),
        });
      }
    }

    return tx.task.update({
      where: { id },
      data: {
        ...taskData,
        completedAt,
        deadline: taskData.deadline !== undefined
          ? taskData.deadline ? new Date(taskData.deadline) : null
          : undefined,
        scheduledDate: taskData.scheduledDate !== undefined
          ? taskData.scheduledDate ? new Date(taskData.scheduledDate) : null
          : undefined,
        recurrenceEndDate: taskData.recurrenceEndDate !== undefined
          ? taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : null
          : undefined,
      },
      include: taskIncludes,
    });
  });

  return task;
}

async function remove(id: string) {
  return prisma.task.delete({ where: { id } });
}

async function getEisenhower() {
  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
    },
    include: taskIncludes,
  });

  return {
    doFirst: tasks.filter((t) => t.isImportant && t.isUrgent),
    schedule: tasks.filter((t) => t.isImportant && !t.isUrgent),
    delegate: tasks.filter((t) => !t.isImportant && t.isUrgent),
    eliminate: tasks.filter((t) => !t.isImportant && !t.isUrgent),
  };
}

async function getSuggestions(limit: number = 5) {
  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
    },
    include: {
      ...taskIncludes,
      blockedBy: { select: { id: true } },
    },
  });

  const scored = tasks.map((task) => ({
    ...task,
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

  return scored.slice(0, limit);
}

export const taskService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getEisenhower,
  getSuggestions,
};
