# Tata Ecommerce (Frontend)

Aplicación SPA en React + TypeScript para el catálogo y flujo de compra de Tata.

## Alcance por sprint

### Sprint 1 (core)
- Autenticación/roles
- Catálogo de productos
- Carrito persistente
- Checkout contado
- Inventario básico

### Sprint 2
- Cuotas
- Verificación de pagos
- Envíos
- Facturación

### Sprint 3
- Reportes
- Notificaciones
- Hardening de seguridad
- Documentación final

## Integración API dólar oficial

Se integró consumo de DolarAPI para trazabilidad USD↔Bs en checkout:

- `GET https://ve.dolarapi.com/v1/dolares/oficial`
- `GET https://ve.dolarapi.com/v1/estado`
- `GET https://ve.dolarapi.com/v1/historicos/dolares/oficial`

La interfaz muestra:
- tasa oficial actual (`promedio`)
- fecha de actualización
- estado de la API
- histórico reciente
- conversión estimada del total del pedido a Bs

## Scripts

```sh
npm install
npm run dev
npm run lint
npm run test
npm run build
```
