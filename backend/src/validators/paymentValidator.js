import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  installmentId: Joi.string().uuid().allow(null),
  paymentType: Joi.string().valid('efectivo', 'transferencia', 'pago_movil').required(),
  bankFrom: Joi.string().allow('', null),
  bankTo: Joi.string().allow('', null),
  accountOrPhone: Joi.string().allow('', null),
  referenceNumber: Joi.string().min(3).max(100).required(),
  amountUsd: Joi.number().positive().required(),
  paidAt: Joi.date().optional(),
});

export const verifyPaymentSchema = Joi.object({
  status: Joi.string().valid('confirmado', 'rechazado').required(),
});
