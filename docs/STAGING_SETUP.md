# Staging Environment — One-Time VPS Setup

Run these steps once. After this, all deploys are automatic via GitHub Actions on push to `main`.

## 1. Create the VPS

1. Create a [HostGator account](https://www.hostgator.com/vps-hosting).
2. New server: **2 vCPU / 2GB RAM / 40GB SSD**, Ubuntu 22.04.
3. Add your local SSH public key during creation.
4. Note the public IP.

> **HostGator SSH port:** HostGator VPS uses port **22022** (not the standard 22). Always pass `-p 22022` when connecting:
> ```bash
> ssh -p 22022 root@<VPS_IP>
> ```

## 2. Install Docker

```bash
ssh -p 22022 root@<VPS_IP>
curl -fsSL https://get.docker.com | sh
```

## 3. Set up DuckDNS (free domain)

1. Go to [duckdns.org](https://www.duckdns.org), sign in with GitHub.
2. Register **two** subdomains, both pointing to your VPS IP:
   - `clara-stg` → web frontend (`https://clara-stg.duckdns.org`)
   - `clara-stg-api` → API (`https://clara-stg-api.duckdns.org`)

   > DuckDNS only supports one subdomain level. `api.clara-stg.duckdns.org` won't work — register two separate subdomains.

3. Confirm DNS resolves: `ping clara-stg.duckdns.org` should return your VPS IP.

## 4. Open firewall ports on HostGator

In the HostGator control panel → Firewall/Security settings, allow inbound:
- TCP 80 (HTTP — required for Let's Encrypt challenge)
- TCP 443 (HTTPS)
- UDP 443 (HTTP/3)

> Port 80 must stay open permanently. Caddy uses it for Let's Encrypt certificate renewal every 90 days.
>
> **Note:** SSH port 22022 should already be open by default on HostGator VPS.

## 5. Clone the repo and configure env

```bash
ssh -p 22022 root@<VPS_IP>
cd /opt
git clone https://github.com/oaugusto256/clara.git
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

## 7. Create a GitHub PAT for container registry

1. Go to GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate new token with scope **`write:packages`**
3. Save it as GitHub secret `GHCR_PAT`

> The `GITHUB_TOKEN` auto-token does not have sufficient permissions to push/pull from ghcr.io for this repo — a PAT is required.

## 8. Link container packages to the repository

After the first manual image push (or first CI run), go to:
`https://github.com/oaugusto256?tab=packages`

For each of `clara-api`, `clara-migrate`, and `clara-web`:
- Click the package → **Package settings → Connect repository → clara**

## 9. Add GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `STG_VPS_HOST` | VPS IP address |
| `STG_VPS_USER` | `root` |
| `STG_VPS_SSH_KEY` | Private key from step 6 |
| `STG_API_URL` | `https://clara-stg-api.duckdns.org` |
| `GHCR_PAT` | PAT from step 7 |

## 10. First deploy

Push or merge anything to `main`. Watch the workflow at:
`https://github.com/oaugusto256/clara/actions`

After it completes:
- **Web:** `https://clara-stg.duckdns.org`
- **API docs:** `https://clara-stg-api.duckdns.org/docs`

> **First startup note:** Caddy takes ~10–30s to issue the Let's Encrypt certificate on first boot. If you get an SSL error, wait and refresh.

## 11. When you buy a real domain

1. Add DNS A records pointing to the VPS IP
2. Update `devops/caddy/Caddyfile.stg` with the new hostnames
3. Update `STG_API_URL` GitHub secret to the new API domain
4. Push to `main` → automatic redeploy with fresh Let's Encrypt cert

## Manual operations

**Re-pull and restart containers on the VPS:**
```bash
ssh -p 22022 root@<VPS_IP>
cd /opt/clara
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg pull
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d
```

**Wipe the database (keeps containers running):**
```bash
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg down -v
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg up -d
```

**View logs:**
```bash
docker compose -f devops/docker/docker-compose.stg.yml --env-file .env.stg logs -f
```
