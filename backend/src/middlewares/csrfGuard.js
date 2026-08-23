import { env } from '../config/env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function extractHost(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (!origin && !referer) {
    return next();
  }

  const requestOrigin = extractHost(origin || referer);
  const allowedOrigin = extractHost(env.corsOrigin);

  if (!requestOrigin || !allowedOrigin || requestOrigin !== allowedOrigin) {
    return res.status(403).json({ ok: false, error: 'CSRF bloqueado por origen inválido' });
  }

  return next();
}
