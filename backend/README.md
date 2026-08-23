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
