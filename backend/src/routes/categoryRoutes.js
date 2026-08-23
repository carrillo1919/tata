import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';

const router = Router();

router.get('/', listCategories);
router.post('/', requireAuth, requireRoles('admin', 'vendedor'), createCategory);
router.patch('/:id', requireAuth, requireRoles('admin', 'vendedor'), updateCategory);
router.delete('/:id', requireAuth, requireRoles('admin'), deleteCategory);

export default router;
