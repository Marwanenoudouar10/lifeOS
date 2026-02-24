import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { habitService } from '../services/habit.service.js';
import { createHabitSchema, updateHabitSchema, habitCheckInSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list habits (include recent entries)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const habits = await habitService.getAll();
    res.json({ data: habits });
  } catch (error) {
    next(error);
  }
});

// POST / - create habit
router.post('/', validate(createHabitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.create(req.body);
    res.status(201).json({ data: habit });
  } catch (error) {
    next(error);
  }
});

// GET /:id - get habit
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.getById(req.params.id as string);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }
    res.json({ data: habit });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update habit
router.patch('/:id', validate(updateHabitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.update(req.params.id as string, req.body);
    res.json({ data: habit });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete habit
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await habitService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /:id/check-in - check in
router.post('/:id/check-in', validate(habitCheckInSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, count, notes } = req.body as {
      date: string;
      count?: number;
      notes?: string;
    };
    const entry = await habitService.checkIn(req.params.id as string, { date, count, notes });
    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
});

// GET /:id/calendar - get entries for date range
router.get('/:id/calendar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!start || !end) {
      res.status(400).json({ error: 'start and end query parameters are required' });
      return;
    }

    const entries = await habitService.getCalendar(req.params.id as string, start, end);
    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
});

// GET /:id/streaks - get streak info
router.get('/:id/streaks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.getById(req.params.id as string);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }
    res.json({
      data: {
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        lastCheckIn: habit.lastCheckIn,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
