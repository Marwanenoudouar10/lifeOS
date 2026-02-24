import { prisma } from '../prisma.js';
import type { CreateProjectInput, UpdateProjectInput } from '@lifeos/shared';
import type { Prisma } from '@prisma/client';

const projectIncludes = {
  milestones: {
    orderBy: { sortOrder: 'asc' as const },
  },
  category: true,
  goal: true,
  _count: {
    select: { tasks: true },
  },
} satisfies Prisma.ProjectInclude;

async function getAll(filters: { status?: string; categoryId?: string; goalId?: string } = {}) {
  const where: Prisma.ProjectWhereInput = {};

  if (filters.status) {
    where.status = filters.status as any;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.goalId) {
    where.goalId = filters.goalId;
  }

  return prisma.project.findMany({
    where,
    include: projectIncludes,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

async function getById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      ...projectIncludes,
      tasks: {
        include: {
          tags: { include: { tag: true } },
          category: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      },
    },
  });
}

async function create(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
    include: projectIncludes,
  });
}

async function update(id: string, data: UpdateProjectInput) {
  return prisma.project.update({
    where: { id },
    data: {
      ...data,
      deadline: data.deadline !== undefined
        ? data.deadline ? new Date(data.deadline) : null
        : undefined,
    },
    include: projectIncludes,
  });
}

async function remove(id: string) {
  return prisma.project.delete({ where: { id } });
}

// ── Milestone CRUD ──────────────────────────────────

async function getMilestones(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: { sortOrder: 'asc' },
  });
}

async function getMilestoneById(id: string) {
  return prisma.milestone.findUnique({
    where: { id },
  });
}

async function createMilestone(projectId: string, data: {
  title: string;
  description?: string;
  dueDate?: string;
  sortOrder?: number;
}) {
  return prisma.milestone.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      sortOrder: data.sortOrder ?? 0,
      projectId,
    },
  });
}

async function updateMilestone(id: string, data: {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: string | null;
  sortOrder?: number;
}) {
  return prisma.milestone.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined
        ? data.dueDate ? new Date(data.dueDate) : null
        : undefined,
    },
  });
}

async function removeMilestone(id: string) {
  return prisma.milestone.delete({ where: { id } });
}

export const projectService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  removeMilestone,
};
