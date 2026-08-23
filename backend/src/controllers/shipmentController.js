import { Order, Shipment, User } from '../models/index.js';
import { updateShipmentStatusSchema } from '../validators/shipmentValidator.js';
import { AppError } from '../utils/errors.js';
import { notifyUser } from '../utils/notifications.js';

const STATUS_FLOW = {
  preparando: ['enviado'],
  enviado: ['en_transito'],
  en_transito: ['entregado'],
  entregado: [],
};

function normalizeDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

export async function listMyShipments(req, res, next) {
  try {
    const shipments = await Shipment.findAll({
      include: [{ model: Order, where: { userId: req.user.id }, attributes: ['id', 'invoiceNumber', 'status', 'totalUsd'] }],
      order: [['updatedAt', 'DESC']],
    });

    res.json({ ok: true, data: shipments });
  } catch (error) {
    next(error);
  }
}

export async function listShipments(req, res, next) {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const shipments = await Shipment.findAll({
      where,
      include: [{
        model: Order,
        attributes: ['id', 'invoiceNumber', 'status', 'totalUsd'],
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      }],
      order: [['updatedAt', 'DESC']],
      limit: 300,
    });

    res.json({ ok: true, data: shipments });
  } catch (error) {
    next(error);
  }
}

export async function updateShipmentStatus(req, res, next) {
  try {
    const payload = await updateShipmentStatusSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const shipment = await Shipment.findByPk(req.params.shipmentId, { include: [Order] });
    if (!shipment || !shipment.Order) {
      throw new AppError('Envío no encontrado', 404);
    }

    if (shipment.status !== payload.status) {
      const allowedNext = STATUS_FLOW[shipment.status] || [];
      if (!allowedNext.includes(payload.status)) {
        throw new AppError(`Transición no permitida de ${shipment.status} a ${payload.status}`, 400);
      }
    }

    const deliveredAt = payload.status === 'entregado' ? new Date() : shipment.deliveredAt;

    await shipment.update({
      status: payload.status,
      trackingNumber: payload.trackingNumber ?? shipment.trackingNumber,
      carrier: payload.carrier ?? shipment.carrier,
      estimatedDeliveryDate: normalizeDate(payload.estimatedDeliveryDate) ?? shipment.estimatedDeliveryDate,
      deliveredAt,
    });

    if (payload.status === 'entregado') {
      await shipment.Order.update({ status: 'entregado' });
    } else if (['enviado', 'en_transito'].includes(payload.status) && shipment.Order.status !== 'entregado') {
      await shipment.Order.update({ status: 'enviado' });
    }

    await notifyUser({
      userId: shipment.Order.userId,
      type: 'shipment_status',
      title: `Actualización de envío ${shipment.Order.invoiceNumber}`,
      message: `Tu pedido ahora está en estado: ${payload.status}`,
      metadata: { shipmentId: shipment.id, orderId: shipment.Order.id, status: payload.status },
    });

    res.json({ ok: true, data: shipment });
  } catch (error) {
    next(error);
  }
}
