import { prisma } from '../prisma.js';
import type { ReminderType } from '@prisma/client';

interface CreateReminderInput {
  taskId?: string;
  type?: ReminderType;
  message?: string;
  triggerAt: string;
}

interface UpdateReminderInput {
  type?: ReminderType;
  message?: string;
  triggerAt?: string;
}

async function getAll(filters: { taskId?: string; isSent?: boolean; isDismissed?: boolean } = {}) {
  const where: any = {};

  if (filters.taskId) {
    where.taskId = filters.taskId;
  }

  if (filters.isSent !== undefined) {
    where.isSent = filters.isSent;
  }

  if (filters.isDismissed !== undefined) {
    where.isDismissed = filters.isDismissed;
  }

  return prisma.reminder.findMany({
    where,
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { triggerAt: 'asc' },
  });
}

async function getById(id: string) {
  return prisma.reminder.findUnique({
    where: { id },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
  });
}

async function create(input: CreateReminderInput) {
  return prisma.reminder.create({
    data: {
      taskId: input.taskId ?? null,
      type: input.type ?? 'NUDGE',
      message: input.message ?? null,
      triggerAt: new Date(input.triggerAt),
    },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
  });
}

async function update(id: string, data: UpdateReminderInput) {
  return prisma.reminder.update({
    where: { id },
    data: {
      ...data,
      triggerAt: data.triggerAt ? new Date(data.triggerAt) : undefined,
    },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
  });
}

async function remove(id: string) {
  return prisma.reminder.delete({ where: { id } });
}

async function getDue() {
  return prisma.reminder.findMany({
    where: {
      triggerAt: { lte: new Date() },
      isSent: false,
      isDismissed: false,
    },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { triggerAt: 'asc' },
  });
}

async function markSent(id: string) {
  return prisma.reminder.update({
    where: { id },
    data: { isSent: true },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
  });
}

async function markManySent(ids: string[]) {
  return prisma.reminder.updateMany({
    where: { id: { in: ids } },
    data: { isSent: true },
  });
}

async function dismiss(id: string) {
  return prisma.reminder.update({
    where: { id },
    data: { isDismissed: true },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
  });
}

export const reminderService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getDue,
  markSent,
  markManySent,
  dismiss,
};
