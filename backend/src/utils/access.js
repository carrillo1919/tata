import { AppError } from './errors.js';

export function canManageOrder(user) {
  return user?.role === 'admin' || user?.role === 'vendedor';
}

export function assertCanReadOrder(user, order) {
  if (!order) {
    throw new AppError('Pedido no encontrado', 404);
  }

  if (canManageOrder(user) || order.userId === user.id) {
    return;
  }

  throw new AppError('No autorizado', 403);
}
