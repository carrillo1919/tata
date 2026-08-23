import { Router } from 'express';
import { listOrderInstallments } from '../controllers/installmentController.js';
import { requireAuth } from '../middlewares/auth.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);

router.get('/orders/:orderId/installments', listOrderInstallments);

export default router;
