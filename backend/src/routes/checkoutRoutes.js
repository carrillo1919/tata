import { Router } from 'express';
import { createCheckout, listMyOrders } from '../controllers/checkoutController.js';
import { requireAuth } from '../middlewares/auth.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);

router.get('/orders/me', listMyOrders);
router.post('/checkout', createCheckout);

export default router;
