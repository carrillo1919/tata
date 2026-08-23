import { Op } from 'sequelize';
import { Order } from '../models/index.js';

export async function nextInvoiceNumber(transaction) {
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const count = await Order.count({
    where: { createdAt: { [Op.gte]: start, [Op.lt]: end } },
    transaction,
  });

  const seq = String(count + 1).padStart(6, '0');
  return `FAC-${year}-${seq}`;
}
