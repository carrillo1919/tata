import { Router } from 'express';
import { collectionsReport, inventoryReport, salesReport } from '../controllers/reportController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);
router.use(requireRoles('admin', 'vendedor'));

router.get('/sales', salesReport);
router.get('/collections', collectionsReport);
router.get('/inventory', inventoryReport);

export default router;
