import { Router } from 'express';
import { listMyNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/auth.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);

router.get('/me', listMyNotifications);
router.patch('/:notificationId/read', markNotificationRead);

export default router;
