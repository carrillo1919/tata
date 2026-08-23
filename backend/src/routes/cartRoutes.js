import { Router } from 'express';
import { addCartItem, clearCart, getMyCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);
router.use(requireRoles('comprador', 'admin', 'vendedor'));

router.get('/me', getMyCart);
router.post('/items', addCartItem);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/me', clearCart);

export default router;
