import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

export default router;
