import { Router } from 'express';
import {
  createPayment,
  listOrderPayments,
  listPendingPayments,
  verifyPayment,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);

router.post('/', requireAuth, requireRoles('comprador', 'admin', 'vendedor'), createPayment);
router.get('/pending', requireAuth, requireRoles('admin', 'vendedor'), listPendingPayments);
router.get('/orders/:orderId', requireAuth, requireRoles('comprador', 'admin', 'vendedor'), listOrderPayments);
router.patch('/:paymentId/verify', requireAuth, requireRoles('admin', 'vendedor'), verifyPayment);

export default router;
