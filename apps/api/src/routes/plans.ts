import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { planService } from '../services/plan.service.js';
import { createPlanItemSchema, createTimeBlockSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /:date - get or create plan for date
router.get('/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await planService.getOrCreateByDate(req.params.date as string);
    res.json({ data: plan });
  } catch (error) {
    next(error);
  }
});

// POST /:date/generate - auto-generate plan
router.post('/:date/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await planService.generatePlan(req.params.date as string);
    res.json({ data: plan });
  } catch (error) {
    next(error);
  }
});

// POST /:date/items - add item to plan
router.post('/:date/items', validate(createPlanItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await planService.getOrCreateByDate(req.params.date as string);
    const item = await planService.addItem(plan.id, req.body);
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
});

// PATCH /:date/items/:itemId - update plan item
router.patch('/:date/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await planService.updateItem(req.params.itemId as string, req.body);
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});

// DELETE /:date/items/:itemId - remove plan item
router.delete('/:date/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await planService.removeItem(req.params.itemId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /:date/overload - check overload
router.get('/:date/overload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await planService.checkOverload(req.params.date as string);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// POST /:date/rollover - rollover incomplete items
router.post('/:date/rollover', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toDate } = req.body as { toDate: string };
    const result = await planService.rollover(req.params.date as string, toDate);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// GET /:date/time-blocks - get time blocks
router.get('/:date/time-blocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await planService.getOrCreateByDate(req.params.date as string);
    const blocks = await planService.getTimeBlocks(plan.id);
    res.json({ data: blocks });
  } catch (error) {
    next(error);
  }
});

// POST /:date/time-blocks - add time block
router.post('/:date/time-blocks', validate(createTimeBlockSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await planService.getOrCreateByDate(req.params.date as string);
    const block = await planService.addTimeBlock(plan.id, req.body);
    res.status(201).json({ data: block });
  } catch (error) {
    next(error);
  }
});

// DELETE /:date/time-blocks/:blockId - remove time block
router.delete('/:date/time-blocks/:blockId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await planService.removeTimeBlock(req.params.blockId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
