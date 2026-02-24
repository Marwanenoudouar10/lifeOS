import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { goalService } from '../services/goal.service.js';
import { createGoalSchema, updateGoalSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list goals
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await goalService.getAll();
    res.json({ data: goals });
  } catch (error) {
    next(error);
  }
});

// POST / - create goal
router.post('/', validate(createGoalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.create(req.body);
    res.status(201).json({ data: goal });
  } catch (error) {
    next(error);
  }
});

// GET /:id - get goal
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.getById(req.params.id as string);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json({ data: goal });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update goal
router.patch('/:id', validate(updateGoalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.update(req.params.id as string, req.body);
    res.json({ data: goal });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete goal
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await goalService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /:id/compute-progress - recompute goal progress
router.post('/:id/compute-progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalService.computeProgress(req.params.id as string);
    res.json({ data: goal });
  } catch (error) {
    next(error);
  }
});

export default router;
