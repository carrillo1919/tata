import Joi from 'joi';

export const checkoutSchema = Joi.object({
  paymentType: Joi.string().valid('contado', 'cuotas').required(),
  shippingUsd: Joi.number().min(0).default(0),
  billingData: Joi.object({
    name: Joi.string().min(2).max(120),
    email: Joi.string().email(),
    phone: Joi.string().max(30).allow('', null),
    document: Joi.string().max(30).allow('', null),
    address: Joi.string().max(255).allow('', null),
    companyName: Joi.string().max(120).allow('', null),
    companyTaxId: Joi.string().max(60).allow('', null),
  }).default({}),
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
