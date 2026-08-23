import { Router } from 'express';
import { listConfigurations, setConfiguration } from '../controllers/configController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRoles } from '../middlewares/roles.js';
import { protectedRouteLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(protectedRouteLimiter);
router.use(requireAuth);
router.use(requireRoles('admin'));

router.get('/', listConfigurations);
router.post('/', setConfiguration);

export default router;
