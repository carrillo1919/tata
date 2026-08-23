import { Notification } from '../models/index.js';
import { AppError } from '../utils/errors.js';

export async function listMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    res.json({ ok: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.notificationId, userId: req.user.id },
    });

    if (!notification) {
      throw new AppError('Notificación no encontrada', 404);
    }

    if (!notification.readAt) {
      await notification.update({ readAt: new Date() });
    }

    res.json({ ok: true, data: notification });
  } catch (error) {
    next(error);
  }
}
