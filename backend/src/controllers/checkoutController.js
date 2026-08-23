import { sequelize } from '../config/database.js';
import {
  Cart,
  CartItem,
  Product,
  Order,
  OrderItem,
  Installment,
  Payment,
  Shipment,
} from '../models/index.js';
import { AppError } from '../utils/errors.js';
import { checkoutSchema } from '../validators/checkoutValidator.js';
import { nextInvoiceNumber } from '../utils/invoice.js';
import { getBcvRate, getNumericConfig } from '../utils/config.js';

async function getCartItems(userId, transaction) {
  const cart = await Cart.findOne({ where: { userId }, transaction });
  if (!cart) {
    throw new AppError('Carrito vacío', 400);
  }

  const items = await CartItem.findAll({ where: { cartId: cart.id }, include: [Product], transaction });
  if (!items.length) {
    throw new AppError('Carrito vacío', 400);
  }

  return { cart, items };
}

function buildInstallments(totalUsd, count, intervalDays, bcvRate, interestPercent) {
  const totalWithInterest = totalUsd * (1 + interestPercent / 100);
  const rawAmount = totalWithInterest / count;
  const baseAmount = Number(rawAmount.toFixed(2));
  const installments = [];
  const now = new Date();

  let assigned = 0;
  for (let index = 1; index <= count; index += 1) {
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + intervalDays * index);

    const amountUsd = index === count
      ? Number((totalWithInterest - assigned).toFixed(2))
      : baseAmount;

    assigned += amountUsd;

    installments.push({
      installmentNumber: index,
      dueDate: dueDate.toISOString().slice(0, 10),
      amountUsd,
      amountBs: Number((amountUsd * bcvRate).toFixed(2)),
      status: 'pendiente',
    });
  }

  return installments;
}

export async function createCheckout(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const payload = await checkoutSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const { cart, items } = await getCartItems(req.user.id, transaction);

    let subtotalUsd = 0;
    for (const item of items) {
      if (!item.Product || item.Product.status !== 'activo') {
        throw new AppError('Producto no disponible en carrito', 400);
      }
      if (item.quantity > item.Product.stockCurrent) {
        throw new AppError(`Stock insuficiente para ${item.Product.name}`, 400);
      }
      subtotalUsd += Number(item.quantity) * Number(item.Product.salePriceUsd);
    }

    const taxPercent = await getNumericConfig('tax_percent', 0);
    const interestPercent = await getNumericConfig('installment_interest_percent', 0);
    const bcvRate = await getBcvRate();

    const taxUsd = Number((subtotalUsd * (taxPercent / 100)).toFixed(2));
    const shippingUsd = Number(payload.shippingUsd || 0);
    const totalUsd = Number((subtotalUsd + taxUsd + shippingUsd).toFixed(2));

    const order = await Order.create({
      userId: req.user.id,
      invoiceNumber: await nextInvoiceNumber(transaction),
      status: 'pendiente',
      subtotalUsd,
      taxUsd,
      shippingUsd,
      totalUsd,
      bcvRate,
      paymentType: payload.paymentType,
      billingData: payload.billingData,
    }, { transaction });

    const orderItemsPayload = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceUsd: item.Product.salePriceUsd,
      totalPriceUsd: Number((Number(item.Product.salePriceUsd) * Number(item.quantity)).toFixed(2)),
    }));

    await OrderItem.bulkCreate(orderItemsPayload, { transaction });

    let installments = [];
    if (payload.paymentType === 'cuotas') {
      installments = buildInstallments(
        totalUsd,
        payload.installments,
        payload.installmentIntervalDays,
        bcvRate,
        interestPercent,
      );

      await Installment.bulkCreate(
        installments.map((installment) => ({ ...installment, orderId: order.id })),
        { transaction },
      );
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    res.status(201).json({
      ok: true,
      data: {
        orderId: order.id,
        invoiceNumber: order.invoiceNumber,
        paymentType: order.paymentType,
        totalUsd: Number(totalUsd.toFixed(2)),
        totalBs: Number((totalUsd * bcvRate).toFixed(2)),
        installments,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem, include: [Product] },
        { model: Installment },
        { model: Payment },
        { model: Shipment },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ ok: true, data: orders });
  } catch (error) {
    next(error);
  }
}
