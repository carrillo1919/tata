import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', listCategories);
router.post('/', protectedRouteLimiter, requireAuth, requireRoles('admin', 'vendedor'), createCategory);
router.patch('/:id', protectedRouteLimiter, requireAuth, requireRoles('admin', 'vendedor'), updateCategory);
router.delete('/:id', protectedRouteLimiter, requireAuth, requireRoles('admin'), deleteCategory);

export default router;
