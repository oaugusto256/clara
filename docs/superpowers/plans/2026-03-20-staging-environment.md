# Staging Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the full Clara stack (web + API + DB) to a Hetzner VPS accessible at a real HTTPS URL (e.g., `clara-stg.duckdns.org`) with automatic deploys triggered by every push to `main`.

**Architecture:** A single Hetzner CX21 VPS runs five Docker containers managed by Docker Compose: `db` (Postgres 16, internal only), `migrate` (one-shot schema push), `api` (Fastify production build), `web` (Nginx serving the Vite static build), and `caddy` (reverse proxy with automatic HTTPS). Images are built by GitHub Actions, pushed to `ghcr.io`, then pulled by the VPS on each deploy. The VPS clones the repo once; CI does `git pull` + `docker compose up` on every merge to `main`.

**Tech Stack:** Docker Compose, Caddy 2, Nginx 1.25, Node 20 Alpine, Postgres 16, GitHub Actions, ghcr.io (GitHub Container Registry), DuckDNS (free domain placeholder)

---

## Architecture Diagram

```
Browser
  │
  ▼
Caddy (ports 80/443, auto HTTPS via Let's Encrypt)
  ├── clara-stg.duckdns.org       ──► web:80   (Nginx + Vite static build)
  └── clara-stg-api.duckdns.org   ──► api:3000 (Fastify)

Internal Docker network (clara-stg):
  db:5432  ◄── api, migrate
```

> **DuckDNS note:** DuckDNS only supports one subdomain level (e.g., `clara-stg.duckdns.org`). Use two separate registrations: `clara-stg` for the web and `clara-stg-api` for the API. `api.clara-stg.duckdns.org` will not resolve.

---

## Key facts about workspace packages

All three workspace packages (`@clara/schemas`, `@clara/rules-engine`, `@clara/ui`) set `"main": "dist/index.js"`. They **must** be compiled before any consuming app (API or web) can use them at runtime. They are not compiled automatically by `pnpm install`.

Build order: `@clara/schemas` → `@clara/rules-engine` → `@clara/api` (for the API image)
Build order: `@clara/schemas` → `@clara/ui` → `@clara/web` (for the web image)

`pnpm install --filter <pkg>...` must always run from the **workspace root** (`/app`), not from a package subdirectory.

---

## File Map

| Action  | Path                                               | Responsibility                                          |
|---------|----------------------------------------------------|---------------------------------------------------------|
| Fix     | `devops/docker/api/Dockerfile.prod`                | Correct install location, build workspace deps, use pnpm deploy |
| Create  | `devops/docker/api/Dockerfile.migrate`             | One-shot drizzle-kit push container                     |
| Modify  | `apps/web/src/api.ts`                              | Read `VITE_API_URL` from build-time env                 |
| Create  | `devops/nginx/nginx.stg.conf`                      | Nginx config for SPA + security headers                 |
| Create  | `devops/docker/web/Dockerfile.stg`                 | Multi-stage: build workspace deps → vite build → Nginx  |
| Create  | `devops/caddy/Caddyfile.stg`                       | Reverse proxy routing + automatic HTTPS                 |
| Create  | `devops/docker/docker-compose.stg.yml`             | Full staging stack using ghcr.io images                 |
| Create  | `.env.stg.example`                                 | Template for staging secrets                            |
| Create  | `.github/workflows/deploy-staging.yml`             | CI/CD: build → push → deploy on merge to main          |
| Modify  | `package.json` (root)                              | Add `stg:up`, `stg:down`, `stg:logs` scripts           |
| Create  | `docs/STAGING_SETUP.md`                            | One-time VPS provisioning guide                         |

---

## Task 1: Fix `@clara/schemas` generate-json-schemas script (remove ts-node dependency)

The `generate-json-schemas` npm script in `@clara/schemas` calls `ts-node scripts/generate-json-schemas.ts`, but `ts-node` is not a declared dependency of this package — it relies on being hoisted from the root workspace, which is not reliable inside a Docker filtered install. The compiled `.js` equivalent (`scripts/generate-json-schemas.js`) already exists in the repo, imports from `'../dist/schemas'` (CommonJS, no TypeScript needed), and has the same logic. Switching to it removes the ts-node dependency entirely.

**Files:**
- Modify: `packages/schemas/package.json`

- [ ] **Step 1: Update the generate-json-schemas script**

Change line:
```json
"generate-json-schemas": "ts-node scripts/generate-json-schemas.ts"
```
To:
```json
"generate-json-schemas": "node scripts/generate-json-schemas.js"
```

- [ ] **Step 2: Verify the build still works locally**

```bash
pnpm --filter @clara/schemas build
```

Expected: Outputs `dist/index.js`, `dist/index.d.ts`, and prints `JSON schemas generated in .../apps/api/src/generated-schemas`.

- [ ] **Step 3: Commit**

```bash
git add packages/schemas/package.json
git commit -m "fix: use pre-compiled JS for generate-json-schemas to remove ts-node dependency"
```

---

## Task 2: Fix API Dockerfile.prod

Three bugs in the current file: (1) missing root `package.json`/`tsconfig.json` so `pnpm install` can't resolve the workspace graph; (2) `pnpm install --filter` run from a package subdirectory instead of workspace root; (3) lean prod stage only copies `apps/api/node_modules`, missing workspace deps (`@clara/schemas`, `@clara/rules-engine`) which live outside that directory.

Fix: install from root, explicitly build workspace deps, use `pnpm deploy --prod` to produce a self-contained bundle with all resolved deps.

**Files:**
- Modify: `devops/docker/api/Dockerfile.prod`

- [ ] **Step 1: Replace the file content**

```dockerfile
# Production Dockerfile for Clara API
FROM node:20-alpine AS base
WORKDIR /app

RUN npm install -g pnpm@8.15.4

# Root workspace coordination files — pnpm resolves the workspace graph from here
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# All workspace packages the API depends on
COPY packages ./packages
COPY apps/api ./apps/api

# MUST run from workspace root (/) — pnpm filter install fails from subdirectories
RUN pnpm install --filter @clara/api...

# Build workspace deps in dependency order.
# They export from dist/ (not src/), so they must be compiled before the API.
RUN pnpm --filter @clara/schemas build
RUN pnpm --filter @clara/rules-engine build

# Build the API
WORKDIR /app/apps/api
RUN pnpm run build

# pnpm deploy creates a self-contained bundle:
# copies dist/ + resolves workspace:* deps as real packages + prod-only node_modules
WORKDIR /app
RUN pnpm --filter @clara/api deploy --prod /deploy

# Lean production image — only the self-contained bundle
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /deploy .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Verify the image builds from repo root**

```bash
docker build -f devops/docker/api/Dockerfile.prod -t clara-api-test .
```

Expected: `Successfully built <sha>` with no errors.

- [ ] **Step 3: Commit**

```bash
git add devops/docker/api/Dockerfile.prod
git commit -m "fix: correct pnpm install location and workspace dep builds in API Dockerfile.prod"
```

---

## Task 3: Create Dockerfile.migrate

The migrate container runs `drizzle-kit push` once and exits. It needs `drizzle-kit` (a devDep of `@clara/api`) and the TypeScript config (`drizzle.config.ts` is parsed natively by drizzle-kit via esbuild — no ts-node needed). It reads `DATABASE_URL` directly from `process.env` (confirmed in `apps/api/drizzle.config.ts:3`).

No lean prod stage needed — this is a one-shot container.

**Files:**
- Create: `devops/docker/api/Dockerfile.migrate`

- [ ] **Step 1: Write the file**

```dockerfile
# Migration runner — runs drizzle-kit push then exits (one-shot container)
FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm@8.15.4

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install from workspace root (includes devDeps — drizzle-kit is a devDep of @clara/api)
RUN pnpm install --filter @clara/api...

WORKDIR /app/apps/api
CMD ["pnpm", "exec", "drizzle-kit", "push", "--config=drizzle.config.ts", "--force"]
```

- [ ] **Step 2: Verify the image builds**

```bash
docker build -f devops/docker/api/Dockerfile.migrate -t clara-migrate-test .
```

Expected: Builds successfully. Don't run it yet (no DB available without the full compose stack).

- [ ] **Step 3: Commit**

```bash
git add devops/docker/api/Dockerfile.migrate
git commit -m "feat: add Dockerfile.migrate for staging DB migrations"
```

---

## Task 4: Update web api.ts for configurable API URL

Vite exposes `import.meta.env.VITE_*` variables baked in at build time. The current file uses `process.env.NODE_ENV` (a Node.js idiom) instead of `import.meta.env.DEV` (the correct Vite idiom). Replace both.

**Files:**
- Modify: `apps/web/src/api.ts`

- [ ] **Step 1: Update the file**

```ts
import axios from "axios";

// VITE_API_URL is injected at build time (Dockerfile.stg --build-arg).
// Falls back to same-host relative URL when not set.
const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "");

const api = axios.create({ baseURL });

export default api;
```

- [ ] **Step 2: Confirm local dev still works**

```bash
pnpm -w -F @clara/web dev
```

Open `http://localhost:3001`. App should load and API calls go to `http://localhost:3000`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/api.ts
git commit -m "feat: use import.meta.env for Vite-compatible API URL configuration"
```

---

## Task 5: Create Nginx config for the web container

**Files:**
- Create: `devops/nginx/nginx.stg.conf`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p devops/nginx
```

```nginx
# devops/nginx/nginx.stg.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Long-lived cache for hashed asset files
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all unmatched routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add devops/nginx/nginx.stg.conf
git commit -m "feat: add nginx config for web SPA container"
```

---

## Task 6: Create web Dockerfile for staging

Three stages: install deps from workspace root, build workspace packages in order, run Vite build, serve with Nginx.

**Files:**
- Create: `devops/docker/web/Dockerfile.stg`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p devops/docker/web
```

```dockerfile
# ── Stage 1: build the Vite app ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@8.15.4

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# Injected by GitHub Actions: --build-arg VITE_API_URL=https://clara-stg-api.duckdns.org
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Install from workspace root
RUN pnpm install --filter @clara/web...

# Build workspace deps in dependency order (@clara/ui exports from dist/, not src/)
RUN pnpm --filter @clara/schemas build
RUN pnpm --filter @clara/ui build

# Build the web app
WORKDIR /app/apps/web
RUN pnpm run build

# ── Stage 2: serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY devops/nginx/nginx.stg.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Verify the image builds**

```bash
docker build \
  -f devops/docker/web/Dockerfile.stg \
  --build-arg VITE_API_URL=http://localhost:3000 \
  -t clara-web-test .
```

Expected: `Successfully built <sha>`. The `vite build` step surfaces any TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add devops/docker/web/Dockerfile.stg
git commit -m "feat: add multi-stage web Dockerfile for staging (Nginx + Vite)"
```

---

## Task 7: Create Caddy reverse proxy config

Caddy fetches and auto-renews Let's Encrypt certificates for any valid public hostname. The config is two lines per domain.

**DuckDNS limitation:** DuckDNS only allows one subdomain level. Use `clara-stg` and `clara-stg-api` as two separate DuckDNS subdomains — not `api.clara-stg.duckdns.org`.

**Files:**
- Create: `devops/caddy/Caddyfile.stg`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p devops/caddy
```

```caddy
# devops/caddy/Caddyfile.stg
#
# Two separate DuckDNS subdomains are required (DuckDNS only supports one level).
# Register both at duckdns.org pointing to your VPS IP:
#   clara-stg       → for the web frontend
#   clara-stg-api   → for the API
#
# When you buy a real domain, replace these two hostnames and redeploy.

clara-stg.duckdns.org {
    reverse_proxy web:80
}

clara-stg-api.duckdns.org {
    reverse_proxy api:3000
}
```

- [ ] **Step 2: Commit**

```bash
git add devops/caddy/Caddyfile.stg
git commit -m "feat: add Caddy staging config for HTTPS reverse proxy"
```

---

## Task 8: Create docker-compose.stg.yml

Pulls pre-built images from `ghcr.io`. All services share an internal network; only Caddy exposes ports to the host.

**Files:**
- Create: `devops/docker/docker-compose.stg.yml`

- [ ] **Step 1: Write the file**

```yaml
# Staging Docker Compose — images are pre-built by CI and pulled from ghcr.io.
# Run from the repo root on the VPS:
#   docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d
services:
  db:
    image: postgres:16-alpine
    container_name: clara_postgres_stg
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_stg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - clara-stg

  migrate:
    image: ghcr.io/${GHCR_OWNER}/clara-migrate:stg
    container_name: clara_migrate_stg
    environment:
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - clara-stg
    restart: on-failure

  api:
    image: ghcr.io/${GHCR_OWNER}/clara-api:stg
    container_name: clara_api_stg
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      db:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    healthcheck:
      # /docs/json is the Fastify swagger JSON endpoint (verified in apps/api/src/index.ts)
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/docs/json | grep -q openapi || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - clara-stg

  web:
    image: ghcr.io/${GHCR_OWNER}/clara-web:stg
    container_name: clara_web_stg
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    networks:
      - clara-stg

  caddy:
    image: caddy:2-alpine
    container_name: clara_caddy_stg
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"   # HTTP/3
    volumes:
      # Path resolves relative to this compose file's location (devops/docker/).
      # ../../devops/caddy/Caddyfile.stg == <repo_root>/devops/caddy/Caddyfile.stg
      - ../../devops/caddy/Caddyfile.stg:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - clara-stg

volumes:
  postgres_stg_data:
  caddy_data:       # Stores Let's Encrypt certs — persisted across restarts
  caddy_config:

networks:
  clara-stg:
    driver: bridge
```

- [ ] **Step 2: Verify the API swagger endpoint path**

Before relying on the healthcheck, confirm the API actually serves `/docs/json`:

```bash
# Start the API locally and test
pnpm -w -F @clara/api run dev &
sleep 5
curl -s http://localhost:3000/docs/json | grep -q '"openapi"' && echo "OK" || echo "WRONG PATH"
```

If the path is different, update the healthcheck `test` command accordingly before committing.

- [ ] **Step 3: Commit**

```bash
git add devops/docker/docker-compose.stg.yml
git commit -m "feat: add docker-compose.stg.yml with Caddy, ghcr.io images, and full staging stack"
```

---

## Task 9: Create `.env.stg.example` and update root scripts

**Files:**
- Create: `.env.stg.example`
- Modify: `package.json` (root scripts)
- Modify: `.gitignore`

- [ ] **Step 1: Write `.env.stg.example`**

```dotenv
# Clara — Staging Environment Variables
# Copy to .env.stg and fill in real values. Never commit .env.stg.

# GitHub Container Registry owner (your GitHub username or org, lowercase)
GHCR_OWNER=your-github-username

# PostgreSQL
POSTGRES_USER=clara_stg
POSTGRES_PASSWORD=changeme_strong_password
POSTGRES_DB=clara_stg

# API DB connection — hostname is the compose service name "db"
DATABASE_URL=postgresql://clara_stg:changeme_strong_password@db:5432/clara_stg
```

- [ ] **Step 2: Broaden the `.gitignore` rule for env files**

```bash
# Add .env.* to gitignore if not already covered (catches .env.stg, .env.prod, etc.)
grep -q "^\.env\.\*$" .gitignore || echo ".env.*" >> .gitignore
```

- [ ] **Step 3: Add scripts to root `package.json`**

In the `"scripts"` section, add:

```json
"stg:up": "docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d",
"stg:down": "docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg down",
"stg:logs": "docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg logs -f"
```

- [ ] **Step 4: Commit**

```bash
git add .env.stg.example .gitignore package.json
git commit -m "feat: add .env.stg.example, gitignore rule, and stg:* npm scripts"
```

---

## Task 10: Create GitHub Actions deploy workflow

Triggers on push to `main`. Builds three images, pushes to `ghcr.io`, then SSHes into the VPS to pull and restart.

**GitHub Secrets required (set in repo Settings → Secrets → Actions):**

| Secret | Value |
|--------|-------|
| `STG_VPS_HOST` | VPS IP address |
| `STG_VPS_USER` | SSH user (`root` or deploy user) |
| `STG_VPS_SSH_KEY` | Private SSH key (ed25519, generated on VPS — see Task 11) |
| `STG_API_URL` | `https://clara-stg-api.duckdns.org` |

**Files:**
- Create: `.github/workflows/deploy-staging.yml`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p .github/workflows
```

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write   # push to ghcr.io; write implies read for pull on VPS

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: devops/docker/api/Dockerfile.prod
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/clara-api:stg

      - name: Build and push Migrate image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: devops/docker/api/Dockerfile.migrate
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/clara-migrate:stg

      - name: Build and push Web image
        # VITE_API_URL is baked into the Vite static build here.
        # Changing the API domain requires updating STG_API_URL secret and re-running.
        uses: docker/build-push-action@v6
        with:
          context: .
          file: devops/docker/web/Dockerfile.stg
          push: true
          build-args: VITE_API_URL=${{ secrets.STG_API_URL }}
          tags: ghcr.io/${{ github.repository_owner }}/clara-web:stg

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        env:
          GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GHCR_USER: ${{ github.actor }}
        with:
          host: ${{ secrets.STG_VPS_HOST }}
          username: ${{ secrets.STG_VPS_USER }}
          key: ${{ secrets.STG_VPS_SSH_KEY }}
          envs: GHCR_TOKEN,GHCR_USER
          script: |
            # Auth with ghcr.io — GITHUB_TOKEN is valid for the duration of this workflow run.
            # For manual re-pulls outside CI, create a PAT with read:packages and run
            # docker login ghcr.io -u <user> -p <pat> manually on the VPS.
            echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

            cd /opt/clara
            git pull origin main

            docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg pull
            docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d --remove-orphans

            # Remove dangling images to reclaim disk space
            docker image prune -f
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-staging.yml
git commit -m "feat: add GitHub Actions CI/CD workflow for staging deploys"
```

---

## Task 11: Write VPS provisioning guide (one-time manual steps)

**Files:**
- Create: `docs/STAGING_SETUP.md`

- [ ] **Step 1: Write the guide**

````markdown
# Staging Environment — One-Time VPS Setup

Run these steps once. After this, all deploys are automatic via GitHub Actions on push to `main`.

## 1. Create the VPS

1. Create a [Hetzner account](https://www.hetzner.com/cloud).
2. New server: **CX21**, Ubuntu 22.04, your nearest region.
3. Add your local SSH public key during creation.
4. Note the public IP.

## 2. Install Docker

```bash
ssh root@<VPS_IP>
curl -fsSL https://get.docker.com | sh
```

## 3. Set up DuckDNS (free domain)

1. Go to [duckdns.org](https://www.duckdns.org), sign in with GitHub.
2. Register **two** subdomains, both pointing to your VPS IP:
   - `clara-stg` → web frontend (`https://clara-stg.duckdns.org`)
   - `clara-stg-api` → API (`https://clara-stg-api.duckdns.org`)

   > DuckDNS only supports one subdomain level. `api.clara-stg.duckdns.org` won't work.

3. Confirm DNS resolves: `ping clara-stg.duckdns.org` should return your VPS IP.

## 4. Open firewall ports on Hetzner

In Hetzner Cloud Console → **Firewalls**, allow inbound:
- TCP 22 (SSH)
- TCP 80 (HTTP — required for Let's Encrypt challenge)
- TCP 443 (HTTPS)

> Port 80 must stay open permanently. Caddy uses it for Let's Encrypt certificate renewal every 90 days.

## 5. Clone the repo and configure env

```bash
ssh root@<VPS_IP>
cd /opt
git clone https://github.com/<your-username>/clara.git
cd clara
cp .env.stg.example .env.stg
nano .env.stg   # Fill in GHCR_OWNER, POSTGRES_PASSWORD, DATABASE_URL
```

## 6. Generate SSH key for GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions-stg" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions   # Copy this entire output
```

Paste the private key output into GitHub secret `STG_VPS_SSH_KEY`.

## 7. Add GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `STG_VPS_HOST` | VPS IP address |
| `STG_VPS_USER` | `root` |
| `STG_VPS_SSH_KEY` | Private key from step 6 |
| `STG_API_URL` | `https://clara-stg-api.duckdns.org` |

## 8. First deploy

Push or merge anything to `main`. Watch at:
`https://github.com/<your-username>/clara/actions`

After it completes:
- **Web:** `https://clara-stg.duckdns.org`
- **API docs:** `https://clara-stg-api.duckdns.org/docs`

## 9. When you buy the real domain

1. Add DNS A records: `stg.clara.app → <VPS_IP>` and `stg-api.clara.app → <VPS_IP>`
2. Update `devops/caddy/Caddyfile.stg` with the new hostnames
3. Update `STG_API_URL` GitHub secret to `https://stg-api.clara.app`
4. Push to `main` → automatic redeploy with new domain and fresh Let's Encrypt cert

## Manual re-pull (if needed outside CI)

The `GITHUB_TOKEN` used during CI expires after the workflow run. To manually re-pull images on the VPS, create a Personal Access Token with `read:packages` scope and run:

```bash
echo "<PAT>" | docker login ghcr.io -u <your-github-username> --password-stdin
cd /opt/clara
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg pull
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d
```
````

- [ ] **Step 2: Commit**

```bash
git add docs/STAGING_SETUP.md
git commit -m "docs: add VPS provisioning guide for staging environment"
```

---

## Task 12: End-to-end smoke test (post first deploy)

No code changes — verifies the pipeline worked.

- [ ] **Step 1: Trigger a deploy**

Push any commit to `main` (or manually re-run the workflow via the Actions tab).

- [ ] **Step 2: Watch the workflow**

All steps should be green at `https://github.com/<your-username>/clara/actions`.

- [ ] **Step 3: Verify HTTPS certificate was issued**

```bash
curl -sv https://clara-stg.duckdns.org 2>&1 | grep "subject:"
```

Expected: Shows a valid Let's Encrypt certificate for your DuckDNS domain.

- [ ] **Step 4: Verify web loads**

Open `https://clara-stg.duckdns.org` in a browser. React app loads with no mixed-content warnings in DevTools console.

- [ ] **Step 5: Verify API is reachable**

```bash
curl -s https://clara-stg-api.duckdns.org/docs/json | grep -q '"openapi"' && echo "API OK"
```

Expected: `API OK`

- [ ] **Step 6: Verify API calls from the web work**

In the browser DevTools → Network tab, perform any action (e.g., load the dashboard). Confirm requests go to `https://clara-stg-api.duckdns.org` and return 200.

- [ ] **Step 7: Verify migrations ran**

```bash
ssh root@<VPS_IP>
docker logs clara_migrate_stg
```

Expected: drizzle-kit output showing schema pushed successfully, container exited with code 0.

- [ ] **Step 8: Tear down test (optional)**

```bash
# On the VPS — stops containers but keeps the postgres volume
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg down
```

---

## Known edge cases and operational notes

| Scenario | Notes |
|---|---|
| DuckDNS subdomain limit | Only one subdomain level — use `clara-stg` + `clara-stg-api` as two separate registrations. |
| `VITE_API_URL` is baked at build time | Changing the API domain requires updating `STG_API_URL` secret and re-running CI. No hot reconfiguration. |
| Caddy cold start HTTPS | First startup takes ~10s for Caddy to get the cert via Let's Encrypt. Subsequent restarts are instant (cert cached in `caddy_data` volume). |
| Port 80 must stay open | Caddy needs port 80 for Let's Encrypt HTTP-01 certificate renewal every 90 days. |
| Postgres data persistence | `docker compose down` keeps `postgres_stg_data`. Use `docker compose down -v` to wipe it. |
| Manual image re-pull | `GITHUB_TOKEN` from CI expires after the run. For manual pulls, create a PAT with `read:packages` — see Task 10 guide. |
| `pnpm deploy` and workspace packages | `pnpm deploy` copies workspace deps (including their `dist/`) to the bundle's `node_modules`. The explicit `RUN pnpm --filter @clara/schemas build` and `RUN pnpm --filter @clara/rules-engine build` steps must run before `pnpm deploy` to ensure `dist/` exists. |
