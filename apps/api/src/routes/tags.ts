import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { tagService } from '../services/tag.service.js';
import { createTagSchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list tags
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await tagService.getAll();
    res.json({ data: tags });
  } catch (error) {
    next(error);
  }
});

// POST / - create tag
router.post('/', validate(createTagSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.create(req.body);
    res.status(201).json({ data: tag });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update tag
router.patch('/:id', validate(createTagSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.update(req.params.id as string, req.body);
    res.json({ data: tag });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete tag
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tagService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
