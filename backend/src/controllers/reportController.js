import { Op } from 'sequelize';
import { Installment, Order, OrderItem, Payment, Product, User } from '../models/index.js';
import { reportQuerySchema } from '../validators/reportValidator.js';
import { toCsv } from '../utils/csv.js';

function buildDateFilter(from, to) {
  if (!from && !to) return undefined;
  const where = {};
  if (from) where[Op.gte] = new Date(from);
  if (to) where[Op.lte] = new Date(to);
  return where;
}

function sendReport(res, rows, format, fileName) {
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    return res.send(toCsv(rows));
  }

  return res.json({ ok: true, data: rows });
}

export async function salesReport(req, res, next) {
  try {
    const query = await reportQuerySchema.validateAsync(req.query, { abortEarly: false, stripUnknown: true });
    const createdAt = buildDateFilter(query.from, query.to);

    const orderWhere = {};
    if (createdAt) orderWhere.createdAt = createdAt;

    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'categoryId'] }] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 1000,
    });

    const filteredOrders = query.categoryId
      ? orders.filter((order) => order.OrderItems.some((item) => item.Product?.categoryId === query.categoryId))
      : orders;

    const rows = filteredOrders.map((order) => ({
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      customer: order.User?.name || 'N/A',
      status: order.status,
      paymentType: order.paymentType,
      subtotalUsd: Number(order.subtotalUsd),
      taxUsd: Number(order.taxUsd),
      shippingUsd: Number(order.shippingUsd),
      totalUsd: Number(order.totalUsd),
      totalBs: Number((Number(order.totalUsd) * Number(order.bcvRate)).toFixed(2)),
      createdAt: order.createdAt,
    }));

    return sendReport(res, rows, query.format, 'reporte-ventas');
  } catch (error) {
    return next(error);
  }
}

export async function collectionsReport(req, res, next) {
  try {
    const query = await reportQuerySchema.validateAsync(req.query, { abortEarly: false, stripUnknown: true });
    const createdAt = buildDateFilter(query.from, query.to);

    const where = {};
    if (createdAt) where.createdAt = createdAt;
    if (query.paymentType) where.paymentType = query.paymentType;
    if (query.vendedorId) where.verifiedByUserId = query.vendedorId;

    const payments = await Payment.findAll({
      where,
      include: [
        { model: Order, attributes: ['invoiceNumber', 'paymentType', 'status'] },
        { model: Installment, attributes: ['installmentNumber', 'dueDate', 'status'] },
        { model: User, as: 'verifiedBy', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 1000,
    });

    const rows = payments.map((payment) => ({
      paymentId: payment.id,
      invoiceNumber: payment.Order?.invoiceNumber || 'N/A',
      orderPaymentType: payment.Order?.paymentType || 'N/A',
      paymentMethod: payment.paymentType,
      referenceNumber: payment.referenceNumber,
      status: payment.status,
      amountUsd: Number(payment.amountUsd),
      amountBs: Number(payment.amountBs),
      installmentNumber: payment.Installment?.installmentNumber || null,
      installmentStatus: payment.Installment?.status || null,
      installmentDueDate: payment.Installment?.dueDate || null,
      verifiedBy: payment.verifiedBy?.name || null,
      createdAt: payment.createdAt,
    }));

    return sendReport(res, rows, query.format, 'reporte-cobros');
  } catch (error) {
    return next(error);
  }
}

export async function inventoryReport(req, res, next) {
  try {
    const query = await reportQuerySchema.validateAsync(req.query, { abortEarly: false, stripUnknown: true });
    const where = {};
    if (query.categoryId) where.categoryId = query.categoryId;

    const products = await Product.findAll({ where, order: [['name', 'ASC']], limit: 1000 });

    const rows = products.map((product) => ({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      status: product.status,
      stockCurrent: Number(product.stockCurrent),
      stockMinAlert: Number(product.stockMinAlert),
      belowMinimum: Number(product.stockCurrent) < Number(product.stockMinAlert),
      salePriceUsd: Number(product.salePriceUsd),
    }));

    return sendReport(res, rows, query.format, 'reporte-inventario');
  } catch (error) {
    return next(error);
  }
}
