import { Router } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { wellnessService } from '../services/wellness.service.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /completion-rate - task completion rate over a period
router.get('/completion-rate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const data = await analyticsService.completionRate(days);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /focus-time - focus session time over a period
router.get('/focus-time', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const data = await analyticsService.focusTime(days);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /momentum - productivity momentum score
router.get('/momentum', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.momentum();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /category-breakdown - tasks breakdown by category
router.get('/category-breakdown', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.categoryBreakdown();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /wellness - wellness/burnout indicators
router.get('/wellness', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wellnessService.detect();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
