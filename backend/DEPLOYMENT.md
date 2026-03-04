# Backend Deployment (Coolify)

## Required Environment Variables

| Variable            | Required | Description                                                         | Example                              |
| ------------------- | -------- | ------------------------------------------------------------------- | ------------------------------------ |
| `DJANGO_SECRET_KEY` | Yes      | Secret key for Django (use a strong random value)                   | `your-50-char-secret`                |
| `POSTGRES_PASSWORD` | Yes      | PostgreSQL password                                                 | `secure-password`                    |
| `POSTGRES_USER`     | No       | PostgreSQL user (default: `notes`)                                  | `notes`                              |
| `POSTGRES_DB`       | No       | PostgreSQL database (default: `notes`)                              | `notes`                              |
| `DATABASE_URL`      | No\*     | Full DB URL (auto-built from POSTGRES\_\* in compose)               | `postgres://user:pass@db:5432/notes` |
| `ALLOWED_HOSTS`     | Yes      | Comma-separated hostnames (localhost/127.0.0.1 are always included for health checks) | `api.notes.zegaru.com`               |
| `CORS_ORIGINS`      | Yes      | Comma-separated frontend origins for CORS                           | `https://app.example.com`            |
| `DEBUG`             | No       | Set to `false` in production                                        | `false`                              |
| `PORT`              | No       | Not used; Caddy listens on 80, Gunicorn on 127.0.0.1:8000           | —                                    |
| `MEDIA_ROOT`        | No       | Persistent path for uploaded files (default: `/data/media` in prod) | `/data/media`                        |
| `STATIC_ROOT`       | No       | Path for collectstatic output (default: `/app/staticfiles`)         | `/app/staticfiles`                   |

\* `DATABASE_URL` is set automatically in docker-compose.prod.yml from `POSTGRES_*` vars.

## Coolify Setup

1. Create a new application from the repository.
2. Use `docker-compose.prod.yml` as the compose file (or set compose path in Coolify).
3. Set the environment variables above in Coolify's env configuration.
4. Ensure `ALLOWED_HOSTS` includes your API domain and `CORS_ORIGINS` includes your frontend URL.
5. The `/health` endpoint is used for health checks; Coolify can probe it.

### Domain Configuration

Coolify handles all proxy/Traefik configuration automatically. No extra labels are needed in the compose file.

- **Ports Exposes**: In Coolify's General → Network, set "Ports Exposes" to `80` (Caddy listens on 80).
- **Domains for backend**: In Coolify's "Domains for backend" field, add your domain **with the port** so Coolify knows where to route traffic inside the container. Example: `https://api.notes.zegaru.com:80` — the `:80` tells Coolify the backend (Caddy) listens on port 80; the proxy still serves it on 80/443 externally.
- **ALLOWED_HOSTS**: Must include every domain that will reach the backend, e.g. `api.notes.zegaru.com,r4scocswsksk0ksw8kcwogo0.5.161.44.15.sslip.io`.

## Troubleshooting: Images not loading / 0 files in Persistent Storage

If uploads work but images return 404 or the Persistent Storage "Files" tab shows 0:

1. **Verify MEDIA_ROOT in Coolify**: In Environment Variables, ensure `MEDIA_ROOT` is `/data/media` and not overridden. The compose file sets it; if Coolify's env overrides, it must match.
2. **Verify port 80**: In General → Network, "Ports Exposes" must be `80` (not 8000).
3. **Upload in production**: Notes with images created locally or in another env have DB references but no files in the prod volume. Upload new images in production to populate the volume.

## Endpoints

- `GET /health` — Health check (returns 200)
- `GET /api/health/` — API health (returns `{"status":"ok"}`)
- `GET /api/docs/` — Swagger UI
