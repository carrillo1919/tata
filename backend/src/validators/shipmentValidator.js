import Joi from 'joi';

export const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid('preparando', 'enviado', 'en_transito', 'entregado').required(),
  trackingNumber: Joi.string().max(120).allow('', null),
  carrier: Joi.string().max(120).allow('', null),
  estimatedDeliveryDate: Joi.date().iso().allow(null),
});
