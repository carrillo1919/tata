import { Router } from 'express';
import { downloadInvoicePdf, getInvoice } from '../controllers/invoiceController.js';
import { requireAuth } from '../middlewares/auth.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);

router.get('/:orderId', getInvoice);
router.get('/:orderId/pdf', downloadInvoicePdf);

export default router;
