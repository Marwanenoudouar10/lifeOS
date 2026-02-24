import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /today - today overview
router.get('/today', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const overview = await dashboardService.getTodayOverview();
    res.json({ data: overview });
  } catch (error) {
    next(error);
  }
});

// GET /upcoming - upcoming tasks
router.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const upcoming = await dashboardService.getUpcoming(days);
    res.json({ data: upcoming });
  } catch (error) {
    next(error);
  }
});

// GET /goals - active goals
router.get('/goals', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await dashboardService.getActiveGoals();
    res.json({ data: goals });
  } catch (error) {
    next(error);
  }
});

export default router;
