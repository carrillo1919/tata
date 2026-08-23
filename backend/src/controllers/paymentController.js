import { sequelize } from '../config/database.js';
import {
  Installment,
  InventoryMovement,
  Order,
  OrderItem,
  Payment,
  Product,
  Shipment,
  User,
} from '../models/index.js';
import { createPaymentSchema, verifyPaymentSchema } from '../validators/paymentValidator.js';
import { AppError } from '../utils/errors.js';
import { getBcvRate } from '../utils/config.js';
import { assertCanReadOrder } from '../utils/access.js';
import { notifyUser } from '../utils/notifications.js';

async function applyInventoryAndShipment(order, verifiedByUserId, transaction) {
  const orderItems = await OrderItem.findAll({ where: { orderId: order.id }, include: [Product], transaction });

  for (const item of orderItems) {
    if (!item.Product) {
      throw new AppError('Producto del pedido no encontrado', 400);
    }

    if (Number(item.Product.stockCurrent) < Number(item.quantity)) {
      throw new AppError(`Stock insuficiente para ${item.Product.name}`, 400);
    }

    await item.Product.update(
      { stockCurrent: Number(item.Product.stockCurrent) - Number(item.quantity) },
      { transaction },
    );

    await InventoryMovement.create({
      productId: item.Product.id,
      userId: verifiedByUserId,
      movementType: 'salida',
      quantity: Number(item.quantity),
      note: `Salida por confirmación de pago pedido ${order.invoiceNumber}`,
    }, { transaction });
  }

  const [shipment] = await Shipment.findOrCreate({
    where: { orderId: order.id },
    defaults: { orderId: order.id, status: 'preparando' },
    transaction,
  });

  if (shipment.status !== 'preparando') {
    await shipment.update({ status: 'preparando' }, { transaction });
  }

  if (order.status !== 'preparando_envio') {
    await order.update({ status: 'preparando_envio' }, { transaction });
  }
}

export async function createPayment(req, res, next) {
  try {
    const payload = await createPaymentSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const order = await Order.findByPk(payload.orderId);
    if (!order || order.userId !== req.user.id) {
      throw new AppError('Pedido no encontrado', 404);
    }

    if (payload.installmentId) {
      const installment = await Installment.findByPk(payload.installmentId);
      if (!installment || installment.orderId !== order.id) {
        throw new AppError('Cuota no encontrada', 404);
      }

      if (Number(payload.amountUsd) < Number(installment.amountUsd)) {
        throw new AppError('Monto insuficiente para cubrir la cuota', 400);
      }
    }

    const duplicateReference = await Payment.findOne({
      where: { orderId: order.id, referenceNumber: payload.referenceNumber },
    });
    if (duplicateReference) {
      throw new AppError('La referencia de pago ya fue registrada para este pedido', 409);
    }

    const bcvRate = await getBcvRate();
    const amountBs = Number((payload.amountUsd * bcvRate).toFixed(2));

    const payment = await Payment.create({
      ...payload,
      paidAt: payload.paidAt || new Date(),
      amountBs,
      bcvRate,
      status: 'pendiente',
    });

    res.status(201).json({ ok: true, data: payment });
  } catch (error) {
    next(error);
  }
}

export async function listPendingPayments(_req, res, next) {
  try {
    const payments = await Payment.findAll({
      where: { status: 'pendiente' },
      include: [
        { model: Order, attributes: ['id', 'invoiceNumber', 'status', 'paymentType', 'totalUsd'] },
        { model: Installment, attributes: ['id', 'installmentNumber', 'dueDate', 'status', 'amountUsd', 'amountBs'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    res.json({ ok: true, data: payments });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const payload = await verifyPaymentSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const payment = await Payment.findByPk(req.params.paymentId, { transaction });
    if (!payment) {
      throw new AppError('Pago no encontrado', 404);
    }

    if (payment.status !== 'pendiente') {
      throw new AppError('El pago ya fue procesado', 400);
    }

    await payment.update({ status: payload.status }, { transaction });

    if (payload.status === 'confirmado') {
      const order = await Order.findByPk(payment.orderId, { transaction });
      if (!order) {
        throw new AppError('Pedido no encontrado', 404);
      }
      const shouldApplyInventory = order.status !== 'pagado';

      if (payment.installmentId) {
        const installment = await Installment.findByPk(payment.installmentId, { transaction });
        if (installment && installment.status !== 'pagado') {
          await installment.update({ status: 'pagado' }, { transaction });
        }

        const pendingInstallments = await Installment.count({
          where: { orderId: order.id, status: 'pendiente' },
          transaction,
        });

        if (pendingInstallments === 0) {
          await order.update({ status: 'pagado' }, { transaction });
          if (shouldApplyInventory) {
            await applyInventoryAndShipment(order, req.user.id, transaction);
          }
        } else {
          const paidInstallments = await Installment.count({
            where: { orderId: order.id, status: 'pagado' },
            transaction,
          });

          if (paidInstallments >= 1) {
            await order.update({ status: 'pagado' }, { transaction });
            if (shouldApplyInventory) {
              await applyInventoryAndShipment(order, req.user.id, transaction);
            }
          }
        }
      } else {
        await order.update({ status: 'pagado' }, { transaction });
        if (shouldApplyInventory) {
          await applyInventoryAndShipment(order, req.user.id, transaction);
        }
      }

      await notifyUser({
        userId: order.userId,
        type: 'payment_verified',
        title: `Pago confirmado para pedido ${order.invoiceNumber}`,
        message: 'Tu pago fue confirmado y tu pedido está en proceso.',
        metadata: { paymentId: payment.id, orderId: order.id },
        transaction,
      });
    } else {
      const order = await Order.findByPk(payment.orderId, { transaction });
      if (order) {
        await notifyUser({
          userId: order.userId,
          type: 'payment_rejected',
          title: `Pago rechazado para pedido ${order.invoiceNumber}`,
          message: 'Tu pago fue rechazado. Revisa los datos e intenta nuevamente.',
          metadata: { paymentId: payment.id, orderId: order.id },
          transaction,
        });
      }
    }

    await payment.update({ verifiedByUserId: req.user.id, verifiedAt: new Date() }, { transaction });

    await transaction.commit();
    res.json({ ok: true });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function listOrderPayments(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.orderId);
    assertCanReadOrder(req.user, order);

    const payments = await Payment.findAll({
      where: { orderId: order.id },
      include: [
        { model: Installment, attributes: ['id', 'installmentNumber', 'dueDate', 'status'] },
        { model: User, as: 'verifiedBy', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ ok: true, data: payments });
  } catch (error) {
    next(error);
  }
}
