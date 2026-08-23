import Joi from 'joi';

export const setConfigSchema = Joi.object({
  key: Joi.string().valid('bcv_rate', 'tax_percent', 'installment_interest_percent').required(),
  value: Joi.object().required(),
});
