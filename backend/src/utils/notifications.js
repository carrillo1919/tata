import { Notification } from '../models/index.js';

export async function notifyUser({ userId, type, title, message, metadata = null, transaction }) {
  return Notification.create({ userId, type, title, message, metadata }, { transaction });
}
