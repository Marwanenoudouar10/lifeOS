import { prisma } from '../prisma.js';
import type { StartFocusInput } from '@lifeos/shared';

async function start(input: StartFocusInput = {}) {
  // Check for existing active session
  const existing = await prisma.focusSession.findFirst({
    where: {
      status: { in: ['RUNNING', 'PAUSED'] },
    },
  });

  if (existing) {
    throw new Error('A focus session is already active. Complete or cancel it first.');
  }

  return prisma.focusSession.create({
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
      taskId: input.taskId ?? null,
      notes: input.notes ?? null,
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function pause(id: string) {
  const session = await prisma.focusSession.findUnique({ where: { id } });

  if (!session) {
    throw new Error(`Focus session not found: ${id}`);
  }

  if (session.status !== 'RUNNING') {
    throw new Error(`Cannot pause a session that is ${session.status}`);
  }

  return prisma.focusSession.update({
    where: { id },
    data: {
      status: 'PAUSED',
      pausedAt: new Date(),
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function resume(id: string) {
  const session = await prisma.focusSession.findUnique({ where: { id } });

  if (!session) {
    throw new Error(`Focus session not found: ${id}`);
  }

  if (session.status !== 'PAUSED') {
    throw new Error(`Cannot resume a session that is ${session.status}`);
  }

  // Calculate pause duration and add to pausedSeconds
  const pauseDuration = session.pausedAt
    ? Math.floor((Date.now() - session.pausedAt.getTime()) / 1000)
    : 0;

  return prisma.focusSession.update({
    where: { id },
    data: {
      status: 'RUNNING',
      pausedAt: null,
      pausedSeconds: session.pausedSeconds + pauseDuration,
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function complete(id: string, notes?: string) {
  const session = await prisma.focusSession.findUnique({ where: { id } });

  if (!session) {
    throw new Error(`Focus session not found: ${id}`);
  }

  if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
    throw new Error(`Session is already ${session.status}`);
  }

  const now = new Date();

  // If it was paused, account for the final pause duration
  let finalPausedSeconds = session.pausedSeconds;
  if (session.status === 'PAUSED' && session.pausedAt) {
    finalPausedSeconds += Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000);
  }

  // Total seconds = wall-clock time from start to now minus paused seconds
  const wallClockSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
  const totalSeconds = Math.max(0, wallClockSeconds - finalPausedSeconds);

  return prisma.focusSession.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: now,
      pausedAt: null,
      pausedSeconds: finalPausedSeconds,
      totalSeconds,
      notes: notes ?? session.notes,
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function cancel(id: string) {
  const session = await prisma.focusSession.findUnique({ where: { id } });

  if (!session) {
    throw new Error(`Focus session not found: ${id}`);
  }

  return prisma.focusSession.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      pausedAt: null,
      completedAt: new Date(),
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function getActive() {
  return prisma.focusSession.findFirst({
    where: {
      status: { in: ['RUNNING', 'PAUSED'] },
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });
}

async function getHistory(limit: number = 50, offset: number = 0) {
  const [sessions, total] = await Promise.all([
    prisma.focusSession.findMany({
      where: { status: 'COMPLETED' },
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.focusSession.count({ where: { status: 'COMPLETED' } }),
  ]);

  return { sessions, total };
}

export const focusService = {
  start,
  pause,
  resume,
  complete,
  cancel,
  getActive,
  getHistory,
};
