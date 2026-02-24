import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { focusService } from '../services/focus.service.js';
import { startFocusSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// POST /start - start session
router.post('/start', validate(startFocusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, notes } = req.body as { taskId?: string; notes?: string };
    const session = await focusService.start({ taskId, notes });
    res.status(201).json({ data: session });
  } catch (error) {
    next(error);
  }
});

// GET /active - get active session
router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await focusService.getActive();
    if (!session) {
      res.json({ data: null });
      return;
    }
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

// GET /history - list completed sessions
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const sessions = await focusService.getHistory(limit, offset);
    res.json({ data: sessions });
  } catch (error) {
    next(error);
  }
});

// POST /:id/pause - pause session
router.post('/:id/pause', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await focusService.pause(req.params.id as string);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

// POST /:id/resume - resume session
router.post('/:id/resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await focusService.resume(req.params.id as string);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

// POST /:id/complete - complete session
router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notes } = req.body as { notes?: string };
    const session = await focusService.complete(req.params.id as string, notes);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

export default router;
