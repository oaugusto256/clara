# Local Development (Front, Back, Database)

This repo includes a documented (docker-based) dev workflow for the **database + backend**, and a native (Vite) dev workflow for the **frontend**.

## Prerequisites

- `pnpm` installed
- `docker` installed and running
- `docker-compose` available (the repo uses `docker-compose` in `@clara/api` scripts)

## 1) One-time setup

From the repo root (`/Users/otavioaugusto/projects/clara`):

```bash
pnpm install
```

## 2) Start Database + Backend (Docker)

The backend + Postgres dev setup is defined in:
- `devops/docker/docker-compose.dev.yml`
- `devops/docker/api/Dockerfile.dev`

### Option A: Use the workspace script (recommended)

```bash
pnpm -w -F @clara/api run dev:all
```

What this does (from `apps/api/package.json`):
- starts the dev docker stack using `docker-compose -f ../../devops/docker/docker-compose.dev.yml up -d`
- includes a one-off `migrate` container that runs `pnpm run db:migrate:docker` before the API starts

### Option B: Run Docker Compose directly

```bash
docker-compose -f devops/docker/docker-compose.dev.yml up -d
```

### Option C: Run DB only (Docker)

```bash
docker-compose -f devops/docker/docker-compose.dev.yml up -d db
```

This exposes Postgres on `localhost:5432` (see the compose `ports` mapping).

### Option D: Run Backend natively (optional)

If you prefer not to run the API inside Docker, start Postgres via Option C, then run:

```bash
pnpm -w -F @clara/api run dev
```

You must ensure `DATABASE_URL` is set for the backend to reach your running Postgres.
If you use the same credentials as the docker env defaults, this usually works:

```bash
export DATABASE_URL="postgresql://root:root@localhost:5432/clara"
```

### Default ports

- API: `http://localhost:3000`
- DB: `localhost:5432` (inside Docker it is reachable as host `db`)

### Verify backend

OpenAPI UI:

```text
http://localhost:3000/docs
```

## 3) Start Frontend (Vite, native)

The frontend is a Vite app configured in:
- `apps/web/package.json`
- `apps/web/vite.config.ts` (uses port `3001`)

In a separate terminal:

```bash
pnpm -w -F @clara/web dev
```

Expected URL:

```text
http://localhost:3001
```

### Backend URL used by the frontend

`apps/web/src/api.ts` uses `http://localhost:3000` when `NODE_ENV === "development"`.
So the frontend expects the API to be reachable on your host at port `3000` (which the Docker stack provides via `3000:3000` in `docker-compose.dev.yml`).

## 4) Environment variables (what matters locally)

Backend database connection:

- Docker Compose loads `../../.env.docker` (see `devops/docker/docker-compose.dev.yml`).
- The API default fallback (when not using `.env.docker`) is defined in `apps/api/src/infra/db/client.ts` and `apps/api/drizzle.config.ts`:
  - `postgresql://root:root@localhost:5432/clara`

The example env file for the API’s DB connection is at:
- `apps/api/.env.example`

For the "native API" option (Option D), create `apps/api/.env` from `apps/api/.env.example` if you plan to run migrations with the non-docker scripts (like `pnpm -F @clara/api run db:migrate`).

## 5) Stopping the stack

To stop/remove containers:

```bash
docker-compose -f devops/docker/docker-compose.dev.yml down
```

## 6) Useful notes / edge cases

- If you change DB schema/migrations, the `migrate` service in `docker-compose.dev.yml` will run only when you (re)start the compose stack.
- If you need to force migrations after the DB is already up, re-run the compose stack (or run the `migrate` container again).

