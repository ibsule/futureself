# Futureself

I built Futureself as a simple app for writing messages today and receiving them later in my inbox. It uses a NestJS API with a React (Vite) frontend, PostgreSQL for storage, Redis + BullMQ for scheduling and background jobs, and [Brevo](https://www.brevo.com/) for email delivery.

Users can write a message, choose a delivery date, and let the system handle the scheduling and sending automatically.

### Why

Most reminder apps are built around tasks and notifications. I wanted something more personal: a way to leave notes for myself that arrive at the right time.

Sometimes it's a reflection I want to revisit months later, a message for an important milestone, encouragement before a difficult period, or just context I know I'll forget with time. Futureself is built around that idea: delayed personal communication instead of productivity tooling.

> **Note** This repository is still in active development

## Prerequisites

- **Node.js** 22.x or current LTS
- **pnpm** 9.x (`npm install -g pnpm`)
- **PostgreSQL** and **Redis** (local install or your own containers)
- **Brevo** API key only if you want real email (optional locally)

## Setup

### 1. Postgres and Redis

Run both on the hosts/ports you'll put in `.env.local`. Defaults below assume `127.0.0.1`.

### 2. Install dependencies

From the repo root:

```bash
pnpm install
```

This installs dependencies for both `apps/api` and `apps/web` in one shot.

### 3. Backend

Create `.env.local` in `apps/api/`. Required keys: `apps/api/src/commons/interfaces/env.ts`.

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

EMAIL_SENDER_NAME=Futureself
EMAIL_SENDER_EMAIL=noreply@example.com
BREVO_API_ENDPOINT=https://api.brevo.com/v3
BREVO_API_KEY=your-brevo-api-key

FRONTEND_URL=http://localhost:5173
```

- `DONT_SEND_EMAIL=true` skips Brevo in dev.
- `FRONTEND_URL` must match where the Vite app runs (CORS).
- Use a strong `APP_KEY` outside local.

### 4. Frontend

Create `.env` in `apps/web/` (copy from `apps/web/.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

Must match backend `APP_PORT`.

## Local dev

Run both from the repo root:

```bash
pnpm dev          # starts both api and web concurrently
```

Or in separate terminals:

| Terminal | Command         |
| -------- | --------------- |
| API      | `pnpm dev:api`  |
| Web      | `pnpm dev:web`  |

App: [http://localhost:5173](http://localhost:5173) — API on port defined in `APP_PORT`.

Register, compose a message, pick a future delivery time. With `DONT_SEND_EMAIL=true`, the queue still runs; email is skipped.

## Scripts

All scripts run from the **repo root** via pnpm:

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | Start both api and web               |
| `pnpm dev:api`    | API dev server with watch            |
| `pnpm dev:web`    | Vite dev server                      |
| `pnpm build`      | Production build for both            |
| `pnpm build:api`  | Production build for api only        |
| `pnpm build:web`  | Production build for web only        |
| `pnpm test`       | Run all tests                        |
| `pnpm lint`       | Lint all packages                    |
| `pnpm format`     | Format all packages                  |