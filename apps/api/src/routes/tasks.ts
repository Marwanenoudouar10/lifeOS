import { Router } from 'express';
import * as chrono from 'chrono-node';
import { validate } from '../middleware/validate.js';
import { taskService } from '../services/task.service.js';
import { createTaskSchema, updateTaskSchema, brainDumpSchema } from '@lifeos/shared';
import type { TaskFilters, TaskPriority } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list tasks with query filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: TaskFilters = {};

    if (req.query.status) {
      const raw = req.query.status as string;
      filters.status = raw.includes(',')
        ? raw.split(',') as TaskFilters['status']
        : raw as TaskFilters['status'];
    }

    if (req.query.priority) {
      const raw = req.query.priority as string;
      filters.priority = raw.includes(',')
        ? raw.split(',') as TaskFilters['priority']
        : raw as TaskFilters['priority'];
    }

    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }

    if (req.query.projectId) {
      filters.projectId = req.query.projectId as string;
    }

    if (req.query.goalId) {
      filters.goalId = req.query.goalId as string;
    }

    if (req.query.context) {
      filters.context = req.query.context as TaskFilters['context'];
    }

    if (req.query.isImportant !== undefined) {
      filters.isImportant = req.query.isImportant === 'true';
    }

    if (req.query.isUrgent !== undefined) {
      filters.isUrgent = req.query.isUrgent === 'true';
    }

    if (req.query.parentId !== undefined) {
      filters.parentId = req.query.parentId === 'null'
        ? null
        : req.query.parentId as string;
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const tasks = await taskService.getAll(filters);
    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

// POST / - create task
router.post('/', validate(createTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.create(req.body);
    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
});

// GET /eisenhower - get Eisenhower matrix
router.get('/eisenhower', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const matrix = await taskService.getEisenhower();
    res.json({ data: matrix });
  } catch (error) {
    next(error);
  }
});

// GET /suggestions - get AI-suggested tasks
router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const suggestions = await taskService.getSuggestions(limit);
    res.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
});

// POST /brain-dump - parse multiple tasks from raw text entries
router.post('/brain-dump', validate(brainDumpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entries } = req.body as { entries: { raw: string }[] };
    const createdTasks = [];

    for (const entry of entries) {
      let raw = entry.raw;
      let deadline: string | undefined;
      let priority: TaskPriority | undefined;
      let estimatedMinutes: number | undefined;

      // Extract deadline using chrono-node
      const parsedDate = chrono.parseDate(raw);
      if (parsedDate) {
        deadline = parsedDate.toISOString();
        // Remove the matched date text from the raw string
        const chronoResults = chrono.parse(raw);
        if (chronoResults.length > 0) {
          raw = raw.replace(chronoResults[0].text, '').trim();
        }
      }

      // Extract priority keywords
      const priorityPatterns: { pattern: RegExp; value: TaskPriority }[] = [
        { pattern: /\b(urgent|critical)\b/i, value: 'CRITICAL' },
        { pattern: /\bhigh\s*(?:priority|prio)?\b/i, value: 'HIGH' },
        { pattern: /\blow\s*(?:priority|prio)?\b/i, value: 'LOW' },
      ];

      for (const { pattern, value } of priorityPatterns) {
        const match = raw.match(pattern);
        if (match) {
          priority = value;
          raw = raw.replace(match[0], '').trim();
          break;
        }
      }

      // Extract time estimates like "30m", "1h", "2 hours", "45 min", "1.5h"
      const timePattern = /\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b|\b(\d+)\s*(?:minutes?|mins?|m)\b/i;
      const timeMatch = raw.match(timePattern);
      if (timeMatch) {
        if (timeMatch[1]) {
          // Hours
          estimatedMinutes = Math.round(parseFloat(timeMatch[1]) * 60);
        } else if (timeMatch[2]) {
          // Minutes
          estimatedMinutes = parseInt(timeMatch[2], 10);
        }
        raw = raw.replace(timeMatch[0], '').trim();
      }

      // Clean up the title: collapse multiple spaces, trim dashes/commas at edges
      const title = raw
        .replace(/\s{2,}/g, ' ')
        .replace(/^[\s,\-:]+|[\s,\-:]+$/g, '')
        .trim();

      if (!title) continue;

      const task = await taskService.create({
        title,
        deadline,
        priority,
        estimatedMinutes,
      });

      createdTasks.push(task);
    }

    res.status(201).json({ data: createdTasks });
  } catch (error) {
    next(error);
  }
});

// GET /:id - get task by id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getById(req.params.id as string);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update task
router.patch('/:id', validate(updateTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.update(req.params.id as string, req.body);
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete task
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await taskService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// PATCH /:id/reorder - update sortOrder
router.patch('/:id/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sortOrder } = req.body as { sortOrder: number };
    const task = await taskService.update(req.params.id as string, { sortOrder });
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

export default router;
