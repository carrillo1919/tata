import { Router } from 'express';
import multer from 'multer';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
const router = Router();

router.get('/', listProducts);
router.post('/', protectedRouteLimiter, requireAuth, requireRoles('admin', 'vendedor'), upload.single('image'), createProduct);
router.patch('/:id', protectedRouteLimiter, requireAuth, requireRoles('admin', 'vendedor'), upload.single('image'), updateProduct);
router.delete('/:id', protectedRouteLimiter, requireAuth, requireRoles('admin'), deleteProduct);

export default router;
