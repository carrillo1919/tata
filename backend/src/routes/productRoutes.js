import { Router } from 'express';
import multer from 'multer';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
const router = Router();

router.get('/', listProducts);
router.post('/', requireAuth, requireRoles('admin', 'vendedor'), upload.single('image'), createProduct);
router.patch('/:id', requireAuth, requireRoles('admin', 'vendedor'), upload.single('image'), updateProduct);
router.delete('/:id', requireAuth, requireRoles('admin'), deleteProduct);

export default router;
