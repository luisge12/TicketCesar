export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}
