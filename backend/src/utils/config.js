import { Configuration } from '../models/index.js';
import { env } from '../config/env.js';

export async function getNumericConfig(key, fallback = 0) {
  const value = await getConfigValue(key, null);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getConfigValue(key, fallback = null) {
  const config = await Configuration.findOne({ where: { key } });
  if (!config?.value || typeof config.value !== 'object') return fallback;
  return config.value.value ?? fallback;
}

export async function getBcvRate() {
  const configRate = await getNumericConfig('bcv_rate', 0);
  if (configRate > 0) return configRate;
  return env.bcvRate > 0 ? env.bcvRate : 1;
}
