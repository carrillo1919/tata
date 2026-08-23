import { Router } from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import configRoutes from './configRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import productRoutes from './productRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tata-backend' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/', checkoutRoutes);
router.use('/payments', paymentRoutes);
router.use('/configurations', configRoutes);

export default router;
