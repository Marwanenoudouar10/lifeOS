import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { projectService } from '../services/project.service.js';
import { createProjectSchema, updateProjectSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list projects
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getAll();
    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
});

// POST / - create project
router.post('/', validate(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.create(req.body);
    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
});

// GET /:id - get project
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getById(req.params.id as string);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update project
router.patch('/:id', validate(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.update(req.params.id as string, req.body);
    res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete project
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /:id/milestones - add milestone
router.post('/:id/milestones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, dueDate } = req.body as {
      title: string;
      description?: string;
      dueDate?: string;
    };
    const milestone = await projectService.createMilestone(req.params.id as string, {
      title,
      description,
      dueDate,
    });
    res.status(201).json({ data: milestone });
  } catch (error) {
    next(error);
  }
});

// PATCH /:projectId/milestones/:milestoneId - update milestone
router.patch('/:projectId/milestones/:milestoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestone = await projectService.updateMilestone(
      req.params.milestoneId as string,
      req.body,
    );
    res.json({ data: milestone });
  } catch (error) {
    next(error);
  }
});

// DELETE /:projectId/milestones/:milestoneId - delete milestone
router.delete('/:projectId/milestones/:milestoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.removeMilestone(req.params.milestoneId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
