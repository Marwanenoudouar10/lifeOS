import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { categoryService } from '../services/category.service.js';
import { createCategorySchema } from '@lifeos/shared';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET / - list categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getAll();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

// POST / - create category
router.post('/', validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id - update category
router.patch('/:id', validate(createCategorySchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.update(req.params.id as string, req.body);
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - delete category
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.remove(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
