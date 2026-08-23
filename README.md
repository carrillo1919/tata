# Tata - Monorepo

Este repositorio ahora está separado por capas:

- `/frontend`: aplicación SPA actual (React + Vite + TypeScript).
- `/backend`: API REST inicial (Node.js + Express + Sequelize + PostgreSQL, ES Modules).

## Estructura

```text
/home/runner/work/tata/tata
├── frontend
└── backend
```

## Frontend

```sh
cd /home/runner/work/tata/tata/frontend
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## Backend

```sh
cd /home/runner/work/tata/tata/backend
cp .env.example .env
npm install
npm run dev
```

Variables requeridas en backend:

- `DATABASE_URL`
- `JWT_SECRET`

Endpoints base:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/docs`
