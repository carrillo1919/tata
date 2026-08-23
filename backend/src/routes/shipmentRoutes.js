import { Router } from 'express';
import { listMyShipments, listShipments, updateShipmentStatus } from '../controllers/shipmentController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);

router.get('/me', requireRoles('comprador', 'admin', 'vendedor'), listMyShipments);
router.get('/', requireRoles('admin', 'vendedor'), listShipments);
router.patch('/:shipmentId/status', requireRoles('admin', 'vendedor'), updateShipmentStatus);

export default router;
