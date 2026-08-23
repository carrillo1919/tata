# Tata Backend

Backend inicial para Tata usando Node.js + Express + Sequelize (PostgreSQL) con ES Modules.

## Requisitos

- Node.js 20+
- PostgreSQL

## Configuración

```sh
cp .env.example .env
```

Variables mínimas:

- `DATABASE_URL`
- `JWT_SECRET`

## Ejecutar

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia servidor con watch
- `npm run start`: inicia servidor sin watch
- `npm run check`: validación sintáctica de `src/server.js`

## API

- Base: `/api`
- Health: `GET /api/health`
- Swagger UI: `GET /api/docs`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Carrito: `GET /api/cart/me`, `POST /api/cart/items`, `PATCH /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `DELETE /api/cart/me`
- Checkout: `POST /api/checkout`, `GET /api/orders/me`
- Pagos: `POST /api/payments`, `GET /api/payments/pending`, `PATCH /api/payments/:paymentId/verify`
- Pagos por pedido: `GET /api/payments/orders/:orderId`
- Cuotas: `GET /api/orders/:orderId/installments`
- Envíos: `GET /api/shipments/me`, `GET /api/shipments`, `PATCH /api/shipments/:shipmentId/status`
- Facturación: `GET /api/invoices/:orderId`, `GET /api/invoices/:orderId/pdf`
- Reportes: `GET /api/reports/sales`, `GET /api/reports/collections`, `GET /api/reports/inventory` (`format=json|csv`)
- Notificaciones: `GET /api/notifications/me`, `PATCH /api/notifications/:notificationId/read`
- Configuración (admin): `GET /api/configurations`, `POST /api/configurations`

## Flujo implementado (Sprint 1 backend)

1. Cliente autenticado agrega productos al carrito persistente.
2. Cliente hace checkout en contado o cuotas.
3. Sistema crea pedido, ítems de pedido y factura correlativa por año.
4. Si es por cuotas, se generan cuotas con vencimiento y monto en USD/Bs.
5. Cliente registra pago.
6. Admin/Vendedor confirma pago.
7. Al confirmar (contado o primera cuota), se marca pedido como pagado, se descuenta inventario y se crea/actualiza envío en estado `preparando`.
8. El flujo de envío se controla por estados (`preparando` → `enviado` → `en_transito` → `entregado`) con notificación al cliente.

## Avance Sprint 2 y Sprint 3 (backend)

- Cuotas: consulta por pedido con actualización automática a `vencido` cuando aplica.
- Verificación de pagos: panel enriquecido con contexto de pedido/cuota y trazabilidad de verificador.
- Envíos: gestión operativa por estado con tracking, carrier y fecha estimada.
- Facturación: endpoint de factura estructurada y descarga PDF.
- Reportes: ventas, cobros e inventario con exportación CSV.
- Notificaciones: bandeja por usuario para cambios de pago y envío.
- Hardening adicional: guard de origen para mitigar CSRF en métodos mutables.
