import { Router } from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import configRoutes from './configRoutes.js';
import installmentRoutes from './installmentRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import productRoutes from './productRoutes.js';
import reportRoutes from './reportRoutes.js';
import shipmentRoutes from './shipmentRoutes.js';

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
router.use('/', installmentRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
