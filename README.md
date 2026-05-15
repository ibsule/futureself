# Future Self API

NestJS API with PostgreSQL (TypeORM), Redis (BullMQ queues), and email via Brevo.

## Prerequisites

- **Node.js** 22.x or current LTS (matches the project’s `@types/node` range)
- **PostgreSQL**
- **Redis**
- A **Brevo** account and API key if you plan to send real emails

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   The app loads `.env.local` first, then `.env.prod` ([`app.module.ts`](src/app.module.ts)). Create a `.env.local` in the project root for local development.

   Required variables are defined in [`src/commons/interfaces/env.ts`](src/commons/interfaces/env.ts). Example for local development:

   ```env
   NODE_ENVIRONMENT=local
   APP_PORT=3000
   APP_KEY=your-secret-signing-key-change-me
   ENABLE_RATE_LIMITING=false
   DONT_SEND_EMAIL=true

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_USER=
   REDIS_PASSWORD=

   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=future_self
   POSTGRES_HOST=127.0.0.1
   POSTGRES_PORT=5432
   POSTGRES_HOST_DOCKER=postgres

   EMAIL_SENDER_NAME=Future Self
   EMAIL_SENDER_EMAIL=noreply@example.com
   BREVO_API_ENDPOINT=https://api.brevo.com/v3
   BREVO_API_KEY=your-brevo-api-key
   ```

   Adjust `POSTGRES_*` and `REDIS_*` to match your running services. Use a strong `APP_KEY` in any shared or deployed environment.

3. **Start PostgreSQL and Redis** on the hosts and ports you configured (for example with local installs or your own Docker setup).

4. **Run the app**

   ```bash
   npm run start:dev
   ```

   The server listens on the port set by `APP_PORT` (see log: `Server running on …`).

## Other scripts

| Command | Purpose |
|--------|---------|
| `npm run build` | Production build |
| `npm run start:prod` | Run compiled app from `dist` |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
