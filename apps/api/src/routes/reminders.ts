import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { reminderService } from '../services/reminder.service.js';
import { createReminderSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list reminders
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reminders = await reminderService.getAll();
    res.json({ data: reminders });
  } catch (error) {
    next(error);
  }
});

// GET /due - get due reminders
router.get('/due', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reminders = await reminderService.getDue();
    res.json({ data: reminders });
  } catch (error) {
    next(error);
  }
});

// POST / - create reminder
router.post('/', validate(createReminderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.create(req.body);
    res.status(201).json({ data: reminder });
  } catch (error) {
    next(error);
  }
});

// POST /:id/dismiss - dismiss reminder
router.post('/:id/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.dismiss(req.params.id as string);
    res.json({ data: reminder });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete reminder
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reminderService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
