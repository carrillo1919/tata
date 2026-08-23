import Joi from 'joi';

export const checkoutSchema = Joi.object({
  paymentType: Joi.string().valid('contado', 'cuotas').required(),
  shippingUsd: Joi.number().min(0).default(0),
  installments: Joi.when('paymentType', {
    is: 'cuotas',
    then: Joi.number().integer().min(2).max(24).required(),
    otherwise: Joi.forbidden(),
  }),
  installmentIntervalDays: Joi.when('paymentType', {
    is: 'cuotas',
    then: Joi.number().integer().min(7).max(60).default(30),
    otherwise: Joi.forbidden(),
  }),
});
