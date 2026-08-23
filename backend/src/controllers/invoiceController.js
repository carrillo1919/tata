import { Installment, Order, OrderItem, Payment, Product, Shipment, User } from '../models/index.js';
import { getConfigValue } from '../utils/config.js';
import { createSimplePdf } from '../utils/pdf.js';
import { assertCanReadOrder } from '../utils/access.js';

async function getInvoiceOrder(orderId) {
  return Order.findByPk(orderId, {
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'phone'] },
      { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
      { model: Payment, attributes: ['id', 'status', 'paymentType', 'amountUsd', 'amountBs', 'referenceNumber', 'paidAt'] },
      { model: Installment, attributes: ['id', 'installmentNumber', 'dueDate', 'amountUsd', 'amountBs', 'status'] },
      { model: Shipment, attributes: ['id', 'status', 'trackingNumber', 'carrier', 'estimatedDeliveryDate', 'deliveredAt'] },
    ],
  });
}

function buildInvoicePayload(order, company) {
  return {
    invoiceNumber: order.invoiceNumber,
    issuedAt: order.createdAt,
    company,
    customer: {
      id: order.User.id,
      name: order.billingData?.name || order.User.name,
      email: order.billingData?.email || order.User.email,
      phone: order.billingData?.phone || order.User.phone,
      document: order.billingData?.document || null,
      address: order.billingData?.address || null,
    },
    totals: {
      subtotalUsd: order.subtotalUsd,
      taxUsd: order.taxUsd,
      shippingUsd: order.shippingUsd,
      totalUsd: order.totalUsd,
      bcvRate: order.bcvRate,
      totalBs: Number((Number(order.totalUsd) * Number(order.bcvRate)).toFixed(2)),
    },
    paymentType: order.paymentType,
    items: order.OrderItems.map((item) => ({
      productId: item.productId,
      sku: item.Product?.sku || null,
      name: item.Product?.name || 'Producto',
      quantity: item.quantity,
      unitPriceUsd: item.unitPriceUsd,
      totalPriceUsd: item.totalPriceUsd,
    })),
    payments: order.Payments,
    installments: order.Installments,
    shipment: order.Shipment,
  };
}

function buildPdfLines(payload) {
  const lines = [
    `Factura: ${payload.invoiceNumber}`,
    `Fecha: ${new Date(payload.issuedAt).toISOString().slice(0, 10)}`,
    `Empresa: ${payload.company.name}`,
    `RIF: ${payload.company.taxId}`,
    `Cliente: ${payload.customer.name}`,
    `Documento: ${payload.customer.document || 'N/A'}`,
    `Direccion: ${payload.customer.address || 'N/A'}`,
    '--- Items ---',
  ];

  payload.items.forEach((item) => {
    lines.push(`${item.quantity} x ${item.name} (${item.sku || 'sin-sku'}) - USD ${item.totalPriceUsd}`);
  });

  lines.push('--- Totales ---');
  lines.push(`Subtotal USD: ${payload.totals.subtotalUsd}`);
  lines.push(`Impuesto USD: ${payload.totals.taxUsd}`);
  lines.push(`Envio USD: ${payload.totals.shippingUsd}`);
  lines.push(`Total USD: ${payload.totals.totalUsd}`);
  lines.push(`Tasa BCV: ${payload.totals.bcvRate}`);
  lines.push(`Total Bs: ${payload.totals.totalBs}`);

  return lines;
}

export async function getInvoice(req, res, next) {
  try {
    const order = await getInvoiceOrder(req.params.orderId);
    assertCanReadOrder(req.user, order);

    const companyName = await getConfigValue('company_name', null);
    const companyTaxId = await getConfigValue('company_tax_id', null);

    const payload = buildInvoicePayload(order, {
      name: order.billingData?.companyName || companyName || 'Tata',
      taxId: order.billingData?.companyTaxId || companyTaxId || 'N/A',
    });

    res.json({ ok: true, data: payload });
  } catch (error) {
    next(error);
  }
}

export async function downloadInvoicePdf(req, res, next) {
  try {
    const order = await getInvoiceOrder(req.params.orderId);
    assertCanReadOrder(req.user, order);

    const payload = buildInvoicePayload(order, {
      name: order.billingData?.companyName || 'Tata',
      taxId: order.billingData?.companyTaxId || 'N/A',
    });

    const pdfBuffer = createSimplePdf(buildPdfLines(payload));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${order.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
