import Joi from 'joi';

export const reportQuerySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  categoryId: Joi.string().uuid(),
  vendedorId: Joi.string().uuid(),
  paymentType: Joi.string().valid('efectivo', 'transferencia', 'pago_movil'),
  format: Joi.string().valid('json', 'csv').default('json'),
});
