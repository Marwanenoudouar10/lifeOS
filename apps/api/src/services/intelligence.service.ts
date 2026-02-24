import { prisma } from '../prisma.js';
import { calculatePriorityScore } from '@lifeos/shared';

async function getSuggestedTasks(limit: number = 10) {
  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
    },
    include: {
      tags: { include: { tag: true } },
      category: true,
      project: true,
      goal: true,
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

  return scored.slice(0, limit).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline,
    scheduledDate: task.scheduledDate,
    estimatedMinutes: task.estimatedMinutes,
    isImportant: task.isImportant,
    isUrgent: task.isUrgent,
    context: task.context,
    energyLevel: task.energyLevel,
    category: task.category,
    project: task.project,
    goal: task.goal,
    tags: task.tags,
    score: task.score,
    reasons: buildReasons(task),
  }));
}

function buildReasons(task: {
  priority: string;
  deadline: Date | null;
  isImportant: boolean;
  isUrgent: boolean;
  estimatedMinutes: number | null;
  goalId: string | null;
  blockedBy: { id: string }[];
}): string[] {
  const reasons: string[] = [];

  if (task.priority === 'CRITICAL') {
    reasons.push('Critical priority');
  } else if (task.priority === 'HIGH') {
    reasons.push('High priority');
  }

  if (task.deadline) {
    const daysUntil = Math.max(
      0,
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 1) {
      reasons.push('Due within 24 hours');
    } else if (daysUntil <= 3) {
      reasons.push('Due within 3 days');
    } else if (daysUntil <= 7) {
      reasons.push('Due this week');
    }
  }

  if (task.isImportant && task.isUrgent) {
    reasons.push('Important and urgent (Do First)');
  } else if (task.isImportant) {
    reasons.push('Important (Schedule)');
  } else if (task.isUrgent) {
    reasons.push('Urgent (Delegate)');
  }

  if (task.estimatedMinutes && task.estimatedMinutes <= 15) {
    reasons.push('Quick win (under 15 min)');
  }

  if (task.goalId) {
    reasons.push('Connected to a goal');
  }

  if (task.blockedBy && task.blockedBy.length > 0) {
    reasons.push(`Blocked by ${task.blockedBy.length} task(s)`);
  }

  return reasons;
}

export const intelligenceService = {
  getSuggestedTasks,
};
