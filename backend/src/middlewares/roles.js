export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }
    return next();
  };
}
