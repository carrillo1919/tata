import { Op } from 'sequelize';
import { Installment, Order, Payment } from '../models/index.js';
import { assertCanReadOrder } from '../utils/access.js';

async function markOverdueInstallments(orderId) {
  const today = new Date().toISOString().slice(0, 10);
  await Installment.update(
    { status: 'vencido' },
    {
      where: {
        orderId,
        status: 'pendiente',
        dueDate: { [Op.lt]: today },
      },
    },
  );
}

export async function listOrderInstallments(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.orderId);
    assertCanReadOrder(req.user, order);

    await markOverdueInstallments(order.id);

    const installments = await Installment.findAll({
      where: { orderId: order.id },
      include: [{ model: Payment, attributes: ['id', 'status', 'amountUsd', 'paymentType', 'createdAt'] }],
      order: [['installmentNumber', 'ASC']],
    });

    res.json({ ok: true, data: installments });
  } catch (error) {
    next(error);
  }
}
