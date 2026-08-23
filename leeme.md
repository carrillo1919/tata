# Tata — Guía completa

Monorepo con frontend SPA y backend API REST para la plataforma de ecommerce Tata.

---

## Tabla de contenidos

1. [Tecnologías](#tecnologías)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Funcionalidades implementadas](#funcionalidades-implementadas)
4. [Desarrollo local](#desarrollo-local)
5. [Variables de entorno](#variables-de-entorno)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Despliegue en Render (producción)](#despliegue-en-render-producción)

---

## Tecnologías

### Frontend

| Tecnología | Versión |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 5 |
| React Router DOM | 6 |
| TanStack Query | 5 |
| Zustand | 5 |
| Tailwind CSS | 3 |
| shadcn/ui (Radix UI) | — |
| React Hook Form + Zod | — |
| Recharts | 2 |
| Framer Motion | 12 |
| Vitest + Testing Library | — |

### Backend

| Tecnología | Versión |
|---|---|
| Node.js | 20+ |
| Express | 5 |
| Sequelize | 6 |
| PostgreSQL | — |
| JWT (jsonwebtoken) | 9 |
| bcryptjs | 3 |
| Joi | 18 |
| Helmet + CORS + Rate Limit | — |
| Multer | 2 |
| Swagger UI Express | 5 |

---

## Estructura del proyecto

```
tata/
├── frontend/          # SPA React + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # API REST Node.js + Express
│   ├── src/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── leeme.md
```

---

## Funcionalidades implementadas

### Sprint 1 — Core

- Autenticación y roles (registro, login, JWT)
- Catálogo de productos con categorías
- Carrito persistente por usuario
- Checkout en contado
- Facturación correlativa por año
- Descuento automático de inventario al confirmar pago

### Sprint 2

- Checkout en cuotas (generación de cuotas con vencimiento en USD/Bs)
- Verificación de pagos con trazabilidad del verificador
- Gestión de envíos por estados (`preparando → enviado → en_transito → entregado`)
- Descarga de facturas en PDF
- Integración con DolarAPI (tasa oficial BCV, histórico, conversión USD↔Bs)

### Sprint 3

- Reportes de ventas, cobros e inventario (JSON y CSV)
- Notificaciones en bandeja por usuario (cambios de pago y envío)
- Hardening de seguridad: guard de origen CSRF en métodos mutables, Helmet, rate limiting
- Documentación Swagger en `/api/docs`

---

## Desarrollo local

### Requisitos previos

- Node.js 20 o superior
- PostgreSQL corriendo localmente (o una URL remota)
- `npm` 9+

---

### 1. Clonar el repositorio

```sh
git clone https://github.com/carrillo1919/tata.git
cd tata
```

---

### 2. Configurar el backend

```sh
cd backend
cp .env.example .env
```

Editar `.env` con los valores reales (ver sección [Variables de entorno](#variables-de-entorno)).

```sh
npm install
npm run dev
```

El servidor queda disponible en: `http://localhost:4000`  
Swagger UI en: `http://localhost:4000/api/docs`

---

### 3. Configurar el frontend

Abrir otra terminal:

```sh
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en: `http://localhost:5173`

---

### 4. Validar y construir

```sh
# Frontend
cd frontend
npm run lint       # eslint
npm run test       # vitest
npm run build      # build de producción en dist/

# Backend
cd backend
npm run check      # validación sintáctica de src/server.js
```

---

## Variables de entorno

Archivo: `backend/.env` (basado en `backend/.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `4000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `******localhost:5432/tata` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `una_clave_larga_y_segura` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `1d` |
| `CORS_ORIGIN` | Origen permitido (frontend) | `http://localhost:5173` |
| `BCV_RATE` | Tasa BCV de respaldo (0 = usar DolarAPI) | `0` |
| `DB_SYNC` | Sincronizar modelos con la BD al iniciar | `true` |

> **Producción:** `DB_SYNC` debe ser `false` y `CORS_ORIGIN` la URL del frontend desplegado.

---

## Endpoints de la API

Base: `http://localhost:4000/api`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| GET | `/docs` | Swagger UI |
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login |
| GET | `/categories` | Listar categorías |
| GET | `/products` | Listar productos |
| GET | `/cart/me` | Ver carrito |
| POST | `/cart/items` | Agregar ítem |
| PATCH | `/cart/items/:itemId` | Actualizar ítem |
| DELETE | `/cart/items/:itemId` | Eliminar ítem |
| DELETE | `/cart/me` | Vaciar carrito |
| POST | `/checkout` | Crear pedido |
| GET | `/orders/me` | Mis pedidos |
| GET | `/orders/:orderId/installments` | Cuotas del pedido |
| POST | `/payments` | Registrar pago |
| GET | `/payments/pending` | Pagos pendientes (admin) |
| PATCH | `/payments/:paymentId/verify` | Verificar pago (admin) |
| GET | `/payments/orders/:orderId` | Pagos por pedido |
| GET | `/shipments/me` | Mis envíos |
| GET | `/shipments` | Todos los envíos (admin) |
| PATCH | `/shipments/:shipmentId/status` | Actualizar estado de envío |
| GET | `/invoices/:orderId` | Factura estructurada |
| GET | `/invoices/:orderId/pdf` | Descargar PDF de factura |
| GET | `/reports/sales` | Reporte de ventas |
| GET | `/reports/collections` | Reporte de cobros |
| GET | `/reports/inventory` | Reporte de inventario |
| GET | `/notifications/me` | Mis notificaciones |
| PATCH | `/notifications/:notificationId/read` | Marcar notificación como leída |
| GET | `/configurations` | Configuración global (admin) |
| POST | `/configurations` | Crear configuración (admin) |

---

## Despliegue en Render (producción)

Se despliegan dos servicios independientes en [Render](https://render.com): uno para el backend y uno para el frontend.

---

### Paso 1 — Crear base de datos PostgreSQL en Render

1. Ir a [dashboard.render.com](https://dashboard.render.com) → **New** → **PostgreSQL**.
2. Rellenar:
   - **Name**: `tata-db`
   - **Region**: la más cercana
   - **Plan**: Free (o el que corresponda)
3. Hacer clic en **Create Database**.
4. Una vez creada, copiar la **Internal Database URL** (se usará en el paso 3).

---

### Paso 2 — Desplegar el backend (Web Service)

1. En el dashboard → **New** → **Web Service**.
2. Conectar el repositorio `carrillo1919/tata`.
3. Configurar:
   - **Name**: `tata-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Plan**: Free
4. En la sección **Environment Variables**, agregar:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | URL interna de la BD copiada en el Paso 1 |
   | `JWT_SECRET` | Una cadena larga y aleatoria |
   | `JWT_EXPIRES_IN` | `1d` |
   | `CORS_ORIGIN` | URL del frontend en Render (se completa después del Paso 3) |
   | `BCV_RATE` | `0` |
   | `DB_SYNC` | `false` |
   | `PORT` | `4000` |

5. Hacer clic en **Create Web Service**.
6. Esperar a que el deploy finalice y copiar la URL pública del backend (ej. `https://tata-backend.onrender.com`).

---

### Paso 3 — Desplegar el frontend (Static Site)

1. En el dashboard → **New** → **Static Site**.
2. Conectar el repositorio `carrillo1919/tata`.
3. Configurar:
   - **Name**: `tata-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. En la sección **Environment Variables**, agregar:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | URL pública del backend del Paso 2 (ej. `https://tata-backend.onrender.com/api`) |

5. Hacer clic en **Create Static Site**.
6. Esperar a que el deploy finalice y copiar la URL pública del frontend (ej. `https://tata-frontend.onrender.com`).

---

### Paso 4 — Actualizar CORS_ORIGIN en el backend

1. Ir al servicio `tata-backend` en Render → **Environment**.
2. Actualizar `CORS_ORIGIN` con la URL del frontend obtenida en el Paso 3.
3. Hacer clic en **Save Changes** → Render redesplegará el backend automáticamente.

---

### Paso 5 — Verificar el despliegue

```sh
# Health check del backend
curl https://tata-backend.onrender.com/api/health

# Swagger UI (abrir en el navegador)
https://tata-backend.onrender.com/api/docs

# Frontend (abrir en el navegador)
https://tata-frontend.onrender.com
```

---

### Notas de producción

- El plan **Free** de Render pone los servicios en suspensión tras 15 minutos de inactividad; la primera petición puede tardar ~30 segundos.
- Render inyecta `PORT` automáticamente en Web Services; asegurarse de que `server.js` use `process.env.PORT`.
- Los redespliegues automáticos se activan con cada push a la rama principal del repositorio.
- Para migraciones de BD se recomienda ejecutar un script de seed/migración como **Job** en Render o activar `DB_SYNC=true` únicamente en el primer despliegue y luego deshabilitarlo.
