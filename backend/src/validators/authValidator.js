import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  role: Joi.string().valid('admin', 'vendedor', 'comprador').default('comprador'),
  phone: Joi.string().allow('', null),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
