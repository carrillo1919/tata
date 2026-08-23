import { Configuration } from '../models/index.js';
import { setConfigSchema } from '../validators/configValidator.js';

export async function listConfigurations(_req, res, next) {
  try {
    const configs = await Configuration.findAll({ order: [['key', 'ASC']] });
    res.json({ ok: true, data: configs });
  } catch (error) {
    next(error);
  }
}

export async function setConfiguration(req, res, next) {
  try {
    const payload = await setConfigSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const [config] = await Configuration.upsert(payload, { returning: true });
    res.status(201).json({ ok: true, data: config });
  } catch (error) {
    next(error);
  }
}
