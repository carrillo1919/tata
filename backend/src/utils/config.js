import { Configuration } from '../models/index.js';
import { env } from '../config/env.js';

export async function getNumericConfig(key, fallback = 0) {
  const config = await Configuration.findOne({ where: { key } });
  if (!config?.value || typeof config.value !== 'object') return fallback;
  const parsed = Number(config.value.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getBcvRate() {
  const configRate = await getNumericConfig('bcv_rate', 0);
  if (configRate > 0) return configRate;
  return env.bcvRate > 0 ? env.bcvRate : 1;
}
